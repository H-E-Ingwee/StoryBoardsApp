from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import base64
import re
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import io

# Load environment variables
load_dotenv()

def _get_hf_api_key() -> str:
    # Reload .env on each request (cheap + avoids confusing "I changed .env but it didn't work")
    load_dotenv(override=True)
    raw = os.environ.get("HUGGINGFACE_API_KEY", "")
    return raw.strip().strip('"').strip("'")

def _get_hf_models() -> tuple[str, str]:
    # Allow swapping models without code changes.
    load_dotenv(override=True)
    # Defaults chosen because they're commonly available via Inference Providers routing.
    text_model = os.environ.get("HF_TEXT_MODEL", "MiniMaxAI/MiniMax-M2.7").strip().strip('"').strip("'")
    image_model = os.environ.get("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell").strip().strip('"').strip("'")
    return text_model, image_model

def _get_client() -> InferenceClient:
    # Use provider auto-routing for maximum compatibility.
    return InferenceClient(provider="auto", api_key=_get_hf_api_key())

app = Flask(__name__)

# Configure CORS for both development and production
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "https://storyai-app.vercel.app",  # Production frontend
    "https://*.vercel.app",  # Any Vercel deployment
]

# Add custom origin from environment variable if provided
env_origin = os.getenv('FRONTEND_URL', '')
if env_origin:
    allowed_origins.append(env_origin)

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
    return jsonify({"status": "success", "message": "StoryAI Python Backend is running on Hugging Face!"}), 200

@app.route('/api/parse-script', methods=['POST', 'OPTIONS'])
def parse_script():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.get_json(force=True, silent=True) or {}
    script_text = data.get('script', '')

    hf_api_key = _get_hf_api_key()
    if not hf_api_key:
        return jsonify({"error": "Backend Error: HUGGINGFACE_API_KEY is missing from your .env file!"}), 400
        
    if not script_text:
        return jsonify({"error": "Backend Error: No script text was received from the frontend!"}), 400

    try:
        text_model, _ = _get_hf_models()
        client = _get_client()

        system = (
            "You are an expert storyboard director and script analyzer. "
            "You must return ONLY valid JSON and no other text."
        )
        user = f"""
Analyze the following script and extract the key visual information.

Script:
{script_text}

You must return ONLY a raw JSON object with this exact structure:
{{
  "characters": [{{"name": "Character's name", "visual_description": "Physical traits, clothing, age, etc."}}],
  "scenes": [{{"caption": "1-2 sentence action description.", "imagePrompt": "Highly detailed visual prompt."}}]
}}
Limit to 3 to 6 logical storyboard scenes.
""".strip()

        completion = client.chat.completions.create(
            model=text_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.2,
        )

        generated_text = (completion.choices[0].message.content or "").strip()
        
        # Robustly extract ONLY the JSON part, stripping away any conversational text
        clean_text = generated_text.strip()
        json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
        if json_match:
            clean_text = json_match.group(0)
            
        result_data = json.loads(clean_text)

        return jsonify({"status": "success", "data": result_data}), 200

    except Exception as e:
        print("Error parsing script:", e)
        text_model, _ = _get_hf_models()
        return jsonify({
            "error": "Hugging Face Text API Error",
            "model": text_model,
            "details": str(e),
            "hint": "If this says the model is not supported, set HF_TEXT_MODEL in storyai-backend/.env"
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
        return jsonify({"error": "Backend Error: HUGGINGFACE_API_KEY is missing from your .env file!"}), 400
        
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