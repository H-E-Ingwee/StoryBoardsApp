from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import base64
import re
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import io

# Load environment variables from .env file (if it exists - ignored in production)
load_dotenv(override=False)

def _get_hf_api_key() -> str:
    # For production (Render), environment variables are set directly
    # For development, they come from .env file
    # Check both HUGGINGFACE_API_KEY and HF_API_KEY for compatibility
    raw = os.environ.get("HUGGINGFACE_API_KEY", "") or os.environ.get("HF_API_KEY", "")
    raw = raw.strip()
    # Handle quoted values
    if raw.startswith('"') and raw.endswith('"'):
        raw = raw[1:-1]
    if raw.startswith("'") and raw.endswith("'"):
        raw = raw[1:-1]
    return raw

def _get_hf_models() -> tuple[str, str]:
    # Allow swapping models without code changes.
    load_dotenv(override=True)
    # Defaults chosen because they work reliably on Hugging Face free tier with text_generation API
    # FLAN-T5 is excellent for instruction following and JSON generation
    text_model = os.environ.get("HF_TEXT_MODEL", "google/flan-t5-large").strip().strip('"').strip("'")
    image_model = os.environ.get("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell").strip().strip('"').strip("'")
    return text_model, image_model

def _get_text_model_candidates() -> list[str]:
    primary_text_model, _ = _get_hf_models()
    # Ensure primary model is clean (no env var names or empty strings)
    if not primary_text_model or "=" in primary_text_model:
        primary_text_model = None
    
    # Use only the most reliable free-tier compatible models
    # gpt2 and distilgpt2 are always available on Hugging Face free tier
    fallback_models = [
        primary_text_model,  # User-configured model first
        "gpt2",               # Always available, simple but reliable
        "distilgpt2",         # Similar to gpt2, faster
    ]

    # Deduplicate and remove None values
    candidates: list[str] = []
    for model in fallback_models:
        if model and model not in candidates and "=" not in model:
            candidates.append(model)
    
    return candidates if candidates else ["gpt2"]  # Ensure we always have at least gpt2

def parse_screenplay_simple(script_text: str) -> dict:
    """
    Fallback parser: simple screenplay format parser that doesn't require LLM.
    Extracts scenes from standard screenplay format (INT./EXT. headers).
    """
    scenes = []
    characters = set()
    
    # Split by scene headers (INT. or EXT. + LOCATION - TIME)
    scene_pattern = r'(INT\.|EXT\.)[^\n]*'
    scene_matches = list(re.finditer(scene_pattern, script_text, re.IGNORECASE))
    
    for i, match in enumerate(scene_matches):
        scene_header = match.group(0)
        
        # Get text until next scene header or end of script
        start_pos = match.end()
        end_pos = scene_matches[i + 1].start() if i + 1 < len(scene_matches) else len(script_text)
        scene_content = script_text[start_pos:end_pos]
        
        # Extract character names (all caps lines followed by dialogue)
        char_pattern = r'^[A-Z][A-Z\s]+$'
        for line in scene_content.split('\n'):
            if re.match(char_pattern, line.strip()) and 3 < len(line.strip()) < 40:
                characters.add(line.strip())
        
        # Create image prompt from scene header and first few lines of action
        action_lines = [l.strip() for l in scene_content.split('\n') 
                       if l.strip() and not re.match(r'^[A-Z][A-Z\s]+$', l.strip())]
        action_text = ' '.join(action_lines[:3])
        
        if len(scenes) < 6:  # Limit to 6 scenes
            scenes.append({
                "scene_number": len(scenes) + 1,
                "caption": scene_header.strip(),
                "imagePrompt": f"{scene_header}. {action_text}"[:200]  # Limit length
            })
    
    # If no scenes found, create one generic scene
    if not scenes:
        scenes.append({
            "scene_number": 1,
            "caption": "SCENE 1: MAIN ACTION",
            "imagePrompt": script_text[:200]  # Use first 200 chars as prompt
        })
    
    # Create character list
    character_list = [
        {"name": char, "visual_description": "Character in the scene"}
        for char in sorted(list(characters))[:5]  # Limit to 5 characters
    ]
    
    return {
        "characters": character_list,
        "scenes": scenes
    }

    # Use provider auto-routing for maximum compatibility
    # Falls back to basic initialization if provider parameter not supported
    api_key = _get_hf_api_key()
    try:
        return InferenceClient(provider="auto", api_key=api_key)
    except TypeError:
        # Older versions don't support provider parameter
        return InferenceClient(api_key=api_key)

app = Flask(__name__)

# Configure CORS for both development and production
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "https://storyai-app.vercel.app",  # Old production frontend
    "https://nuru-storyai.vercel.app",  # Current production frontend
]

# Add custom origins from environment variables if provided
frontend_url = os.getenv('FRONTEND_URL', '')
if frontend_url:
    allowed_origins.append(frontend_url)

# Also support comma-separated list of URLs
extra_urls = os.getenv('EXTRA_CORS_ORIGINS', '')
if extra_urls:
    allowed_origins.extend([url.strip() for url in extra_urls.split(',')])

CORS(app, 
     resources={r"/api/*": {
         "origins": allowed_origins,
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True
     }},
     supports_credentials=True
)

# NOTE: We use huggingface_hub.InferenceClient which handles provider routing + formats.

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        return '', 204
    hf_key = _get_hf_api_key()
    has_key = bool(hf_key)
    return jsonify({
        "status": "success", 
        "message": "StoryAI Python Backend is running on Hugging Face!",
        "api_key_configured": has_key
    }), 200

@app.route('/api/parse-script', methods=['POST', 'OPTIONS'])
def parse_script():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.get_json(force=True, silent=True) or {}
    script_text = data.get('script', '')

    hf_api_key = _get_hf_api_key()
    if not hf_api_key:
        error_msg = "HUGGINGFACE_API_KEY environment variable is not set. Set it in Render dashboard (Settings > Environment Variables)."
        print(f"ERROR: {error_msg}", flush=True)
        return jsonify({"error": f"Backend Error: {error_msg}"}), 400
        
    if not script_text:
        return jsonify({"error": "Backend Error: No script text was received from the frontend!"}), 400

    try:
        text_model, _ = _get_hf_models()
        text_candidates = _get_text_model_candidates()
        client = _get_client()

        prompt = f"""Analyze the following screenplay and extract visual information for storyboarding.

Script:
{script_text}

Return ONLY valid JSON (no other text):
{{
  "characters": [{{"name": "Name", "visual_description": "Physical traits"}}],
  "scenes": [{{"caption": "1-2 sentence action", "imagePrompt": "Detailed visual description"}}]
}}
Limit to 3-6 scenes. Output ONLY JSON."""

        # Use text_generation instead of chat completions (more reliable on free tier)
        generated_text = None
        last_error = None
        model_used = text_model
        for candidate_model in text_candidates:
            try:
                generated_text = client.text_generation(
                    prompt=prompt,
                    model=candidate_model,
                    max_new_tokens=2000,
                    temperature=0.3,
                )
                model_used = candidate_model
                break
            except Exception as model_err:
                last_error = model_err
                print(f"Text model failed ({candidate_model}): {model_err}", flush=True)
                continue

        if generated_text is None:
            raise RuntimeError(f"All text model attempts failed: {last_error}")
        
        # Extract the text (might be a string or object depending on client version)
        if isinstance(generated_text, dict):
            text_output = generated_text.get('generated_text', str(generated_text))
        else:
            text_output = str(generated_text)
        
        # Robustly extract ONLY the JSON part
        clean_text = text_output.strip()
        json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
        if json_match:
            clean_text = json_match.group(0)
            
        result_data = json.loads(clean_text)

        return jsonify({"status": "success", "model": model_used, "data": result_data}), 200

    except Exception as e:
        print("Error parsing script with LLM:", e, flush=True)
        print("Falling back to simple screenplay parser...", flush=True)
        
        try:
            # Fallback: use simple screenplay parser that doesn't require LLM
            result_data = parse_screenplay_simple(script_text)
            return jsonify({
                "status": "success", 
                "model": "fallback-simple-parser",
                "data": result_data,
                "note": "Using fallback parser (LLM unavailable)"
            }), 200
        except Exception as fallback_err:
            print("Fallback parser also failed:", fallback_err, flush=True)
            return jsonify({
                "error": "Script parsing failed",
                "details": str(e),
                "note": "Both LLM and fallback parser failed. Check logs."
            }), 502

# --- Image Generation Endpoint ---
@app.route('/api/generate-image', methods=['POST', 'OPTIONS'])
def generate_image():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.get_json(force=True, silent=True) or {}
    prompt = data.get('prompt', '')

    hf_api_key = _get_hf_api_key()
    if not hf_api_key:
        error_msg = "HUGGINGFACE_API_KEY environment variable is not set. Set it in Render dashboard (Settings > Environment Variables)."
        print(f"ERROR: {error_msg}", flush=True)
        return jsonify({"error": f"Backend Error: {error_msg}"}), 400
        
    if not prompt:
        return jsonify({"error": "Backend Error: No image prompt was received from the frontend!"}), 400

    try:
        _, image_model = _get_hf_models()
        client = _get_client()

        image = client.text_to_image(
            prompt=prompt,
            model=image_model,
        )

        buf = io.BytesIO()
        image.save(buf, format="PNG")
        image_bytes = buf.getvalue()
        base64_encoded = base64.b64encode(image_bytes).decode('utf-8')

        return jsonify({
            "status": "success", 
            "image_base64": base64_encoded
        }), 200

    except Exception as e:
        print("Error generating image:", e)
        _, image_model = _get_hf_models()
        return jsonify({
            "error": "Hugging Face Image API Error",
            "model": image_model,
            "details": str(e),
            "hint": "If this says the model is not supported, set HF_IMAGE_MODEL in storyai-backend/.env"
        }), 502

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)