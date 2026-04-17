# StoryAI Deployment Guide

**Complete guide to deploying StoryAI to free hosting services**

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Testing](#post-deployment-testing)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Deployment Overview

### What Gets Deployed?

**Frontend (React/Vite)**
- Runs on: Vercel (free tier)
- Domain: `yourdomain.vercel.app`
- Includes: All React components, styling, routing
- Build time: ~2-3 minutes
- Auto-deploys on git push to main branch

**Backend (Flask)**
- Runs on: Render (free tier)
- Domain: `yourapp.onrender.com`
- Includes: Script parsing API, image generation API
- Cold start: ~30-50 seconds (free tier limitation)
- Uses Hugging Face for AI models (no local GPU needed)

**Database & Auth**
- Already using Firebase (cloud-hosted)
- No deployment needed
- Free tier: 1GB storage, 50k read/write ops per day
- More than enough for testing/development

### Architecture After Deployment

```
┌─────────────────┐
│   End Users     │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────┐
│   Vercel Frontend           │
│   (React/Vite App)          │
│   yourdomain.vercel.app     │
└────────┬──────────────────┬─┘
         │                  │
      REST API        Firebase Auth
    for AI features    & Firestore
         │                  │
         ▼                  ▼
┌──────────────┐      ┌──────────────┐
│ Render API   │      │   Firebase   │
│ (Flask)      │      │   (Cloud)    │
└──────────────┘      └──────────────┘
         │
         ▼
┌──────────────────────┐
│  Hugging Face API    │
│  (AI Models)         │
└──────────────────────┘
```

### Hosting Service Comparison

| Service | Frontend | Backend | Pros | Cons |
|---------|----------|---------|------|------|
| **Vercel** | ✅ | ❌ | Optimized for Next.js/React, fast deploys | Limited backend support |
| **Netlify** | ✅ | ⚠️ | Good React support, functions available | Limited function runtime |
| **Render** | ✅ | ✅ | Great for full-stack, includes backend | Slower cold starts |
| **Railway** | ✅ | ✅ | Easy full-stack, generous free tier | Can hit limits quickly |
| **Heroku** | ✅ | ✅ | Industry standard | Limited free tier now |

**Recommendation**: Vercel (frontend) + Render (backend) = Best free option

---

## Prerequisites

### Required Before Deployment

1. **GitHub Account**
   - Create at https://github.com/join if needed
   - Repository must be public or use free private repos

2. **Git Installed**
   ```bash
   git --version  # Should show version 2.x or higher
   ```

3. **Environment Variables Ready**
   - Firebase credentials (VITE_FIREBASE_*)
   - Hugging Face API key (HF_API_KEY)
   - Model names configured

4. **Repository Pushed to GitHub**
   ```bash
   git push origin main
   ```

### Verify Repository Structure

Your repository should have this structure:

```
StoryBoardsApp/
├── storyai/                 # Frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.local          # LOCAL ONLY - don't commit
├── storyai-backend/         # Backend
│   ├── app.py
│   ├── requirements.txt
│   ├── .env                # LOCAL ONLY - don't commit
│   └── Procfile            # For Render
├── .gitignore
└── README.md
```

### Checking Your .gitignore

Make sure sensitive files are NOT committed:

```bash
# In your repository root, verify:
cat .gitignore
```

Should include:
```
.env
.env.local
.env*.local
node_modules/
__pycache__/
*.pyc
.venv/
venv/
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Update build configuration** in [storyai/vite.config.js](storyai/vite.config.js):

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

2. **Create [storyai/vercel.json](storyai/vercel.json)**:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

3. **Verify package.json scripts** in [storyai/package.json](storyai/package.json):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### Step 2: Connect GitHub to Vercel

1. Go to https://vercel.com/signup
2. Click **"Sign up with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Select your StoryBoardsApp repository
5. Click **"Import Project"**

### Step 3: Configure Build Settings

1. **Project Name**: `storyai-app` (or your choice)
2. **Framework**: React
3. **Root Directory**: `storyai`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### Step 4: Add Environment Variables

1. In Vercel project settings:
   - Go to **Settings** → **Environment Variables**
   - Add these variables:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_BASE_URL=https://yourbackend.onrender.com
```

2. Click **"Save"**

### Step 5: Deploy Frontend

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. You'll get a URL like: `https://storyai-app.vercel.app`
4. Visit the URL to verify it loads (Firebase auth should work)

**Expected Result:**
- Landing page loads
- Can click "Sign In"
- Login redirects to Firebase auth
- But API calls will fail (backend not deployed yet)

---

## Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Create [storyai-backend/requirements.txt](storyai-backend/requirements.txt)**:

```
Flask==2.3.3
Flask-CORS==4.0.0
python-dotenv==1.0.0
huggingface-hub==0.17.0
Pillow==10.0.0
requests==2.31.0
gunicorn==21.2.0
```

2. **Create [storyai-backend/Procfile](storyai-backend/Procfile)**:

```
web: gunicorn app:app
```

3. **Update [storyai-backend/app.py](storyai-backend/app.py) for production**:

Add at the top:

```python
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import base64
from PIL import Image
from io import BytesIO

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS - allow requests from Vercel frontend
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://storyai-app.vercel.app",
            "http://localhost:3000",
            "http://localhost:5173"
        ]
    }
})

# Configuration
HF_API_KEY = os.getenv('HF_API_KEY')
HF_TEXT_MODEL = os.getenv('HF_TEXT_MODEL', 'mistralai/Mistral-7B-Instruct-v0.1')
HF_IMAGE_MODEL = os.getenv('HF_IMAGE_MODEL', 'black-forest-labs/FLUX.1-schnell')

# Initialize Hugging Face clients
text_client = InferenceClient(api_key=HF_API_KEY)
image_client = InferenceClient(api_key=HF_API_KEY)
```

4. **Ensure CORS headers are set** in API responses:

```python
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'StoryAI Backend',
        'version': '1.0.0'
    })

@app.route('/api/parse-script', methods=['POST', 'OPTIONS'])
def parse_script():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        script_text = data.get('script', '')
        
        if not script_text:
            return jsonify({'error': 'No script provided'}), 400
        
        # Parse using Hugging Face LLM
        prompt = f"""Parse this screenplay and extract structured data.
        
Screenplay:
{script_text}

Return JSON with:
- scenes: array of {{location, time, description}}
- characters: array of character names
- shots: array of {{sceneIndex, description, character}}

JSON Response:"""
        
        response = text_client.text_generation(
            prompt=prompt,
            max_new_tokens=1500,
            temperature=0.5
        )
        
        # Parse response
        import json
        result = json.loads(response)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e), 'hint': 'Check script format'}), 500

@app.route('/api/generate-image', methods=['POST', 'OPTIONS'])
def generate_image():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        # Generate image using FLUX
        image = image_client.text_to_image(
            prompt=prompt,
            model=HF_IMAGE_MODEL,
            height=512,
            width=512
        )
        
        # Convert to base64
        buffer = BytesIO()
        image.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            'imageUrl': f'data:image/png;base64,{img_base64}',
            'prompt': prompt
        })
    
    except Exception as e:
        return jsonify({'error': str(e), 'hint': 'Check image generation settings'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

5. **Test locally**:

```bash
cd storyai-backend
pip install -r requirements.txt
FLASK_ENV=production python app.py
# Should show: Running on http://0.0.0.0:5000
```

### Step 2: Connect to Render

1. Go to https://render.com/signup
2. Sign up with GitHub
3. Authorize Render
4. Click **"New +"** → **"Web Service"**
5. Select your StoryBoardsApp repository
6. Configure:
   - **Name**: `storyai-api`
   - **Root Directory**: `storyai-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free

### Step 3: Add Environment Variables in Render

1. In Render dashboard, go to your service
2. Click **"Environment"**
3. Add variables:

```
HF_API_KEY=your_huggingface_api_key
HF_TEXT_MODEL=mistralai/Mistral-7B-Instruct-v0.1
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
```

4. Click **"Save Changes"**

### Step 4: Deploy Backend

1. Render automatically deploys when you push to GitHub
2. Or click **"Manual Deploy"** in dashboard
3. Wait for build to complete (5-10 minutes for first deploy)
4. Get your URL: `https://storyai-api.onrender.com`
5. Test: Visit `https://storyai-api.onrender.com/api/health`
   - Should return: `{"status": "healthy", ...}`

---

## Environment Configuration

### Firebase Setup

Your Firebase credentials should already be in `.env.local` (frontend):

```
VITE_FIREBASE_API_KEY=AIzaSyDxxx...
VITE_FIREBASE_AUTH_DOMAIN=storyai-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=storyai-xxx
VITE_FIREBASE_STORAGE_BUCKET=storyai-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

To get these:
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Click gear icon → **Project Settings**
4. Scroll to "Your apps"
5. Copy configuration

### Hugging Face API Key

1. Create account at https://huggingface.co/join
2. Go to Settings → API tokens
3. Create new token (read access is fine)
4. Add to both Vercel and Render environment variables as `HF_API_KEY`

### Updating API Base URL

After backend is deployed, update Vercel environment variable:

1. Vercel Dashboard → Project Settings → Environment Variables
2. Update `VITE_API_BASE_URL=https://storyai-api.onrender.com`
3. Redeploy frontend (trigger by pushing to GitHub or manually)

---

## Post-Deployment Testing

### Test 1: Frontend Loads

1. Visit `https://storyai-app.vercel.app`
2. Verify:
   - ✅ Landing page loads
   - ✅ Navigation works
   - ✅ Can click "Sign In"

### Test 2: Firebase Auth Works

1. Click "Sign In" on landing page
2. Sign in with email or Google
3. Verify:
   - ✅ Redirects to Firebase auth
   - ✅ Can authenticate
   - ✅ Redirects back to dashboard

### Test 3: Backend API Works

1. Open browser DevTools (F12)
2. Go to Dashboard (after authentication)
3. Create new project
4. Try uploading a script
5. Check DevTools → Network tab:
   - ✅ Request to `/api/parse-script` succeeds (200 status)
   - ✅ Response contains parsed scenes/shots

### Test 4: Image Generation Works

1. In Editor, customize a shot
2. Click "Generate Image"
3. Check DevTools → Network:
   - ✅ Request to `/api/generate-image` succeeds
   - ✅ Image appears in panel

### Test 5: Firebase Firestore Works

1. Create and edit projects
2. Go to Firebase Console
3. Check Firestore data:
   - ✅ New documents created
   - ✅ Real-time updates work

### Troubleshooting Tests

**API returns 404:**
- Verify Render is deployed
- Check URL in Vercel environment variables
- Trigger re-deploy on both services

**CORS error:**
- Update Vercel URL in Render CORS settings
- Redeploy Render backend

**Auth fails:**
- Verify Firebase credentials in Vercel
- Check Firebase allowed domains in console

---

## Troubleshooting

### Frontend Won't Load

**Symptom**: Blank page or "404" error

**Solutions**:
1. Check Vercel build logs:
   - Vercel Dashboard → Deployments → Click latest
   - Look for build errors
2. Check browser console (F12):
   - Look for JavaScript errors
3. Verify environment variables:
   - All `VITE_*` variables set correctly
4. Clear browser cache (Ctrl+Shift+Delete)

### Backend API Errors

**Symptom**: "502 Bad Gateway" or timeouts

**Solutions**:
1. Check Render logs:
   - Render Dashboard → Logs tab
   - Look for Python errors
2. Verify Hugging Face API key:
   - Test key at https://huggingface.co/settings/tokens
3. Check model availability:
   - Visit model pages on Hugging Face
4. Render free tier has cold starts (30-50s first request)

**Hugging Face Model Not Found**:
```python
# Try alternative models:
HF_TEXT_MODEL = 'gpt2'  # Smaller, faster
HF_IMAGE_MODEL = 'stabilityai/stable-diffusion-2'  # Alternative
```

### Database Not Syncing

**Symptom**: Projects created but not appearing

**Solutions**:
1. Check Firebase Project ID matches
2. Verify Firestore rules allow writes:
   - Firebase Console → Firestore → Rules
   - Set to "Start in test mode" initially
3. Check user authentication:
   - Verify user is logged in
   - Check Firebase Auth in console

### CORS Errors

**Symptom**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution in [storyai-backend/app.py](storyai-backend/app.py)**:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # Allow all origins (test only)
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

## Monitoring & Maintenance

### Monitoring Performance

**Vercel Dashboard**:
- Analytics tab shows traffic and performance
- Build times and deployment history
- Edge function performance

**Render Dashboard**:
- Logs show API requests and errors
- Metrics show CPU and memory usage
- Uptime status

### Managing Costs

**Free Tier Limits**:

| Service | Limit | Impact |
|---------|-------|--------|
| Vercel | 100GB bandwidth/month | Plenty for testing |
| Render | 750 hours/month free | Runs continuously |
| Firebase | 50k read/write ops/day | ~2k daily users |
| Hugging Face | Free tier available | Text & image generation included |

**To avoid costs**:
- Monitor Hugging Face API usage
- Keep Firebase in free tier limits
- Don't enable paid addons

### Updating Code

**To deploy updates**:

1. Make changes locally
2. Test everything works
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
4. Both Vercel and Render auto-deploy from main branch
5. Deployments happen automatically (2-5 minutes total)

### Scaling to Paid (When Needed)

**When to upgrade**:
- More than 10k daily users
- Want faster cold start times
- Need 24/7 guaranteed uptime
- Want custom domains

**Upgrade path**:
- Vercel Pro: $20/month
- Render: Paid plans $7+/month
- Firebase: Pay-as-you-go

---

## Deployment Checklist

Before deploying, verify:

- [ ] Code pushed to GitHub (public repo)
- [ ] `.env` and `.env.local` in `.gitignore`
- [ ] `requirements.txt` created with all dependencies
- [ ] `Procfile` created for backend
- [ ] `vercel.json` created for frontend
- [ ] Firebase credentials ready
- [ ] Hugging Face API key generated
- [ ] Tests pass locally
- [ ] npm build succeeds: `cd storyai && npm run build`
- [ ] Backend runs locally: `cd storyai-backend && python app.py`

---

## What's Next?

After successful deployment:

1. **Enable custom domain** (optional):
   - Vercel: Domains section in project settings
   - Render: Custom domain in environment

2. **Set up analytics**:
   - Vercel Analytics for frontend performance
   - Render monitoring for backend uptime

3. **Enable backups**:
   - Firebase automatic daily backups
   - Export data regularly

4. **Add monitoring**:
   - Set up alerts for downtime
   - Monitor error rates

5. **Prepare for scale**:
   - Optimize database queries
   - Implement caching
   - Plan database migration to paid tier

---

**Deployment complete! Your app is now live on the internet.**

For issues or questions, refer to:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Flask Docs: https://flask.palletsprojects.com/
