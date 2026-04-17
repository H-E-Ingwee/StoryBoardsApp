# 🎬 StoryAI - AI-Powered Storyboard Creation

<div align="center">

[![Status](https://img.shields.io/badge/Status-Live-green?style=for-the-badge)](https://nuru-storyai.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-React_19-blue?style=for-the-badge&logo=react)](https://nuru-storyai.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Flask-black?style=for-the-badge&logo=flask)](https://storyai-t565.onrender.com)
[![Database](https://img.shields.io/badge/Database-Firebase-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Transform your scripts into stunning visual storyboards in minutes using AI-powered automation.**

[🚀 Live Demo](https://nuru-storyai.vercel.app) • [📖 Documentation](./DEVELOPER_DOCUMENTATION.md) • [🐛 Report Bug](https://github.com/H-E-Ingwee/StoryBoardsApp/issues) • [💡 Request Feature](https://github.com/H-E-Ingwee/StoryBoardsApp/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

**StoryAI** is an intelligent storyboarding platform that combines artificial intelligence with creative control. Whether you're a filmmaker, animator, or content creator, StoryAI streamlines your pre-production workflow by:

- 🤖 Automatically parsing scripts into visual shots
- 🖼️ Generating AI artwork for each scene
- ✏️ Fine-tuning cinematography details (angles, lenses, lighting)
- 👥 Collaborating with team members in real-time
- 📊 Exporting professional storyboards

### 🎨 Design Philosophy

**Creative Control + AI Efficiency = Perfect Storyboards**

We believe creators should retain full creative control while leveraging AI to accelerate the tedious parts of production planning.

---

## ✨ Features

### 📝 Intelligent Script Parsing
- **AI-Powered Analysis**: Mistral-7B LLM automatically detects scenes, shots, and action
- **Character Extraction**: Identifies and catalogs characters with visual descriptions
- **Production Notes**: Extracts key details for production planning
- **Manual Editing**: Override AI parsing with custom shot descriptions

### 🎬 Advanced Cinematography Controls
| Feature | Details |
|---------|---------|
| **Shot Sizes** | Extreme Wide, Wide, Medium, Close-up, Extreme Close-up |
| **Camera Angles** | Low, Eye-level, High, Dutch, Overhead |
| **Lens Selection** | 16mm, 24mm, 35mm, 50mm, 85mm, 200mm |
| **Lighting** | Golden Hour, Harsh, Soft, Neon, Atmospheric |
| **Time of Day** | Dawn, Morning, Afternoon, Dusk, Night |

### 🖼️ AI Image Generation
- **FLUX.1-schnell Model**: State-of-the-art image generation
- **Batch Processing**: Generate multiple takes for each shot
- **Style Presets**: Cinematic, Watercolor, Pencil Sketch, Film Noir, Graphic Novel, African Cinema
- **Character Consistency**: Maintains character appearance across scenes
- **Unlimited Retries**: Generate until you find the perfect frame

### 💼 Team Collaboration
- **Real-time Updates**: Firestore live updates for instant collaboration
- **Creator Profiles**: User accounts with custom preferences
- **Project Management**: Organize multiple projects and versions
- **Admin Controls**: Manage team access and permissions
- **Export Options**: PDF, image sequences, and more

---

## 🏗️ Tech Stack

### Frontend
```
React 19.2.4          - UI Framework
Vite 8.0.4            - Build tool with HMR
React Router 7.14.1   - SPA routing
Firebase SDK 12.12.0  - Auth & Database
Tailwind CSS 3.4.19   - Utility-first styling
Lucide React 1.8.0    - Icon library
JSZip 3.10.1          - Export functionality
```

**Deployed on:** [Vercel](https://vercel.com) (100GB bandwidth/month free tier)

### Backend
```
Flask 2.3.3           - Web framework
Flask-CORS 4.0.0      - Cross-origin requests
Hugging Face Hub 0.24.7 - LLM & Image model inference
Pillow 11.1.0         - Image processing
Gunicorn 21.2.0       - WSGI server
Python 3.11+          - Runtime
```

**Deployed on:** [Render](https://render.com) (750 hours/month free tier)

### Cloud Services
```
Firebase Firestore    - Real-time database
Firebase Auth         - OAuth & email/password
Hugging Face APIs     - Text & image inference
```

### AI Models
```
Mistral-7B            - Script parsing & analysis
FLUX.1-schnell        - High-quality image generation
```

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER (React)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Landing Page │ Dashboard │ Editor │ Export              │  │
│  │  ✓ OAuth Login  ✓ Projects ✓ Shots  ✓ Download           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           ↑                              ↓
        HTTPS                       HTTPS/REST
           ↑                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              FIREBASE (Auth & Real-time Database)                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────┐    │
│  │ Auth Service │  │ Firestore (Live) │  │ Cloud Storage  │    │
│  │ (OAuth)      │  │ (Projects/Shots) │  │ (Images)       │    │
│  └──────────────┘  └──────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
           ↑                              ↓
        HTTPS                    REST API (JSON)
           ↑                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            BACKEND API (Flask on Render)                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ /api/health      │  │ /api/parse-script│  │ /api/generate│  │
│  │ ✓ Status check   │  │ ✓ LLM inference  │  │ ✓ Image gen  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           ↑                              ↓
        HTTPS                    Inference API
           ↑                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           HUGGING FACE INFERENCE APIs                             │
│  ┌────────────────────────┐  ┌──────────────────────────────┐   │
│  │ Text Generation        │  │ Image Generation             │   │
│  │ (Mistral-7B)           │  │ (FLUX.1-schnell)             │   │
│  │ ✓ Script analysis      │  │ ✓ Shot rendering             │   │
│  │ ✓ Character extraction │  │ ✓ Multiple takes             │   │
│  └────────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git
- Hugging Face API key ([Get one free](https://huggingface.co/settings/tokens))
- Firebase project ([Setup here](https://console.firebase.google.com))

### 1️⃣ Clone & Install

```bash
# Clone repository
git clone https://github.com/H-E-Ingwee/StoryBoardsApp.git
cd StoryBoardsApp

# Install frontend dependencies
cd storyai
npm install

# Install backend dependencies
cd ../storyai-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2️⃣ Configure Environment

**Frontend** (`.env.local` in `storyai/` folder):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5000
```

**Backend** (`.env` in `storyai-backend/` folder):
```env
HF_API_KEY=hf_your_hugging_face_key_here
HF_TEXT_MODEL=MiniMaxAI/MiniMax-M2.7
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
```

### 3️⃣ Run Locally

**Terminal 1 - Backend:**
```bash
cd storyai-backend
source venv/bin/activate
python app.py
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd storyai
npm run dev
# Opens at http://localhost:5173
```

### 4️⃣ Test the Workflow

1. Open http://localhost:5173
2. Sign up or login with Google
3. Click "New Project"
4. Paste a screenplay snippet:
   ```
   INT. COFFEE SHOP - DAY
   
   John enters, orders coffee. The barista greets him warmly.
   
   JOHN
   The usual, please.
   ```
5. Click "Parse Script" → Wait for AI analysis
6. Customize shots with camera angles, lenses, etc.
7. Click "Generate Image" → Watch AI create visuals
8. Export as PDF or download frames

---

## 💻 Development

### Project Structure

```
StoryBoardsApp/
├── storyai/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Public landing page
│   │   │   ├── Login.jsx            # Authentication page
│   │   │   ├── Dashboard.jsx        # Project management
│   │   │   └── Editor.jsx           # Main storyboard editor
│   │   ├── components/              # Reusable React components
│   │   ├── lib/
│   │   │   ├── firebase.js          # Firebase config
│   │   │   ├── auth.jsx             # Auth context
│   │   │   └── projectModel.js      # Data models
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── storyai-backend/                 # Backend (Flask)
│   ├── app.py                       # Main Flask app
│   ├── requirements.txt             # Python dependencies
│   ├── Procfile                     # Render deployment config
│   └── .env                         # Environment variables (NOT committed)
│
├── docs/                            # Documentation
│   ├── DEVELOPER_DOCUMENTATION.md
│   ├── USER_GUIDE.md
│   ├── IMPLEMENTATION_STEPS.md
│   └── DEPLOYMENT_GUIDE.md
│
└── README.md                        # This file
```

### Running Tests

```bash
# Frontend
cd storyai
npm run build    # Production build
npm run preview  # Test production build locally

# Backend
cd storyai-backend
python -m pytest tests/  # Run tests (when added)
```

### Common Development Tasks

**Update dependencies:**
```bash
# Frontend
cd storyai
npm update

# Backend
cd storyai-backend
pip list --outdated
pip install --upgrade package_name
```

**Debug API calls:**
```bash
# Check backend health
curl http://localhost:5000/api/health

# Test script parsing
curl -X POST http://localhost:5000/api/parse-script \
  -H "Content-Type: application/json" \
  -d '{"script":"INT. ROOM - DAY\n\nCharacter enters."}'
```

---

## 🌐 Deployment

### Frontend (Vercel)

**Automatic deployment when you push to `main`:**

```bash
git push origin main
```

Vercel will:
1. Build with `npm run build`
2. Output to `dist/`
3. Deploy to https://nuru-storyai.vercel.app

**Manual deployment:**
1. Go to https://vercel.com/dashboard
2. Select `StoryBoardsApp` project
3. Click "Redeploy"

### Backend (Render)

**Automatic deployment when you push to `main`:**

Render watches your GitHub repo and redeploys on every push.

**Manual deployment:**
1. Go to https://dashboard.render.com
2. Select `storyai-t565` service
3. Click "Manual Deploy" → "Deploy Latest Commit"

### Environment Variables

**Vercel** (Frontend):
1. Go to Project Settings → Environment Variables
2. Set all `VITE_*` variables

**Render** (Backend):
1. Go to Service Settings → Environment
2. Set `HF_API_KEY` and other `HF_*` variables

---

## 📡 API Documentation

### Health Check

```http
GET /api/health HTTP/1.1
Host: storyai-t565.onrender.com
```

**Response:**
```json
{
  "status": "success",
  "message": "StoryAI Python Backend is running on Hugging Face!",
  "api_key_configured": true
}
```

### Parse Script

**Request:**
```http
POST /api/parse-script HTTP/1.1
Content-Type: application/json

{
  "script": "INT. COFFEE SHOP - DAY\n\nJohn enters and orders coffee."
}
```

**Response:**
```json
{
  "data": {
    "scenes": [
      {
        "scene_number": 1,
        "caption": "SCENE 1: COFFEE SHOP MORNING",
        "imagePrompt": "Interior of a cozy coffee shop with warm morning lighting, John ordering at counter",
        "character_list": ["John"]
      }
    ],
    "characters": [
      {
        "name": "John",
        "visual_description": "Male character, professional attire, morning mood"
      }
    ]
  }
}
```

### Generate Image

**Request:**
```http
POST /api/generate-image HTTP/1.1
Content-Type: application/json

{
  "prompt": "Wide shot of coffee shop interior with morning light filtering through windows, warm and inviting atmosphere, cinematic shot, 35mm lens, 8k resolution"
}
```

**Response:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/8NQDQAEBQIAX8jx0gAAAABJRU5ErkJggg==",
  "timestamp": 1713350000
}
```

**Error Response (400/502):**
```json
{
  "error": "Backend Error: Description of what went wrong"
}
```

---

## 👨‍💻 Usage Guide

### 1. Create a Project

```
Dashboard → "New Project" → Name your project
```

### 2. Upload Your Script

```
Editor → Script Editor → Paste screenplay
```

**Supported formats:**
- Standard screenplay format
- Plain text with scene headers
- Character dialogue with action lines

### 3. Parse Script

```
"Parse Script" button → AI analyzes → Shots appear
```

**AI automatically extracts:**
- ✓ Scene locations
- ✓ Shot descriptions
- ✓ Character names
- ✓ Key actions/emotions

### 4. Customize Shots

```
Click shot → Adjust:
  • Shot size (wide, medium, close-up)
  • Camera angle (low, eye-level, high)
  • Lens (16mm, 35mm, 85mm, 200mm)
  • Lighting preset
  • Time of day
  • Custom notes
```

### 5. Generate Images

```
"Generate Image" → Select art style → Click "Generate"
```

**Try multiple takes:**
- Generate takes automatically appear
- Select your favorite
- Pin to project

### 6. Export Storyboard

```
"Export" → Choose format:
  • PDF (complete storyboard)
  • PNG sequence (individual frames)
  • ZIP (all assets)
```

---

## 🐛 Troubleshooting

### "CORS Error" - API calls blocked

**Solution:**
- Backend not running? Start it: `python app.py`
- Wrong API URL? Check `VITE_API_BASE_URL` env var
- Update Render authorized domains in Firebase Console

### "Firebase auth/unauthorized-domain"

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to "Authorized domains"
3. Example: `nuru-storyai.vercel.app`

### "HUGGINGFACE_API_KEY is missing"

**Solution:**
1. Go to Render dashboard
2. Settings → Environment
3. Set `HF_API_KEY=hf_your_key_here`
4. Restart service

### Script parsing returns 502 Bad Gateway

**Solution:**
- Check Render logs: Dashboard → Logs
- Likely causes:
  - Hugging Face API rate limit (wait 1 minute)
  - Invalid API key (regenerate)
  - Model unavailable (try different model)

### Images aren't generating

**Solution:**
- Check API key is new (not the exposed one)
- Verify quota on Hugging Face
- Check prompt length (too long may fail)
- Try simpler prompt first

### Real-time updates not working

**Solution:**
- Check Firebase connection
- Verify Firestore rules allow reads/writes
- Check browser console for errors

---

## 🤝 Contributing

We welcome contributions! Here's how:

### 1. Fork the repository
```bash
git clone https://github.com/YOUR_USERNAME/StoryBoardsApp.git
cd StoryBoardsApp
```

### 2. Create a feature branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make your changes
- Keep commits atomic and descriptive
- Test thoroughly before pushing
- Follow existing code style

### 4. Push and create PR
```bash
git push origin feature/amazing-feature
# Then create Pull Request on GitHub
```

### PR Guidelines
- ✅ Write clear PR description
- ✅ Reference any related issues (#123)
- ✅ Test on both frontend and backend
- ✅ Update documentation if needed

---

## 📊 Performance Metrics

### Frontend (Vercel)
- ⚡ First Contentful Paint: ~1.2s
- 🎯 Lighthouse Score: 95+
- 📦 Bundle Size: ~750KB (gzipped)

### Backend (Render)
- 🚀 API Response: 200-500ms (excluding inference)
- 🧠 Script Parsing: 3-8 seconds
- 🖼️ Image Generation: 15-45 seconds

### Database (Firebase)
- 📝 Realtime sync: <500ms
- 💾 Storage: Free tier (5GB)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

Need help?

- 📖 [Full Documentation](./DEVELOPER_DOCUMENTATION.md)
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 👤 [User Guide](./USER_GUIDE.md)
- 🐛 [Report Issues](https://github.com/H-E-Ingwee/StoryBoardsApp/issues)

---

## 🎉 Acknowledgments

Built with:
- [React](https://react.dev) - UI Framework
- [Firebase](https://firebase.google.com) - Backend as a Service
- [Hugging Face](https://huggingface.co) - AI Models
- [Vercel](https://vercel.com) - Frontend Hosting
- [Render](https://render.com) - Backend Hosting
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

<div align="center">

**Made with ❤️ by the StoryAI Team**

⭐ Star us on GitHub if you find this useful!

[↑ Back to top](#-storyai---ai-powered-storyboard-creation)

</div>
