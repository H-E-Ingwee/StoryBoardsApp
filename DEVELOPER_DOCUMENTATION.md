# StoryAI - Developer Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Development Setup](#development-setup)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [API Documentation](#api-documentation)
8. [Data Models & Database](#data-models--database)
9. [Authentication Flow](#authentication-flow)
10. [Core Workflows](#core-workflows)
11. [Component Guide](#component-guide)
12. [Deployment Guide](#deployment-guide)

---

## System Architecture

### High-Level Overview

StoryAI is a full-stack web application with a **client-server architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                   USER BROWSER                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │         React Frontend (Vite)                     │  │
│  │  - Authentication (Firebase)                      │  │
│  │  - Project Management (Firestore)                 │  │
│  │  - Script Parsing & Editing                       │  │
│  │  - Image Generation UI                            │  │
│  │  - Export & Collaboration                         │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────┘
                           │ HTTP/CORS
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐       ┌──────────┐      ┌──────────┐
    │Firebase│       │ Flask    │      │Hugging   │
    │Auth    │       │Backend   │      │Face API  │
    │        │       │(Python)  │      │(Remote)  │
    └────────┘       └──────────┘      └──────────┘
        │
        ▼
    ┌──────────┐
    │Firestore │ (Cloud Database)
    │Database  │
    └──────────┘
```

### Key Components

1. **Frontend (React)**: UI, state management, real-time sync with Firestore
2. **Backend (Flask)**: API wrapper around Hugging Face models
3. **Firestore**: Real-time database for projects, user data, and artifacts
4. **Firebase Auth**: User authentication and session management
5. **Hugging Face APIs**: AI models for text parsing and image generation

---

## Technology Stack

### Frontend
- **React 19.2.4** - UI framework
- **Vite 8.0.4** - Build tool and dev server
- **React Router 7.14.1** - Client-side routing
- **Firebase 12.12.0** - Authentication & Firestore
- **Tailwind CSS 3.4.19** - Utility-first CSS framework
- **Lucide React 1.8.0** - Icon library
- **JSZip 3.10.1** - ZIP file generation for exports

### Backend
- **Flask** - Lightweight Python web framework
- **Flask-CORS** - Cross-Origin Resource Sharing support
- **Hugging Face Hub** - Access to AI models
- **Python 3.x** - Backend runtime

### Infrastructure
- **Firestore** - NoSQL cloud database
- **Firebase Authentication** - User identity and access management
- **Hugging Face Inference API** - Cloud-hosted AI models

---

## Project Structure

```
StoryBoardsApp/
├── storyai/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Public landing page
│   │   │   ├── Auth.jsx             # Login/signup page
│   │   │   ├── Dashboard.jsx        # Project management dashboard
│   │   │   ├── Editor.jsx           # Main storyboard editor
│   │   │   ├── Profile.jsx          # User profile management
│   │   │   └── Admin.jsx            # Admin panel
│   │   ├── components/
│   │   │   ├── AppShell.jsx         # Main app layout wrapper
│   │   │   └── StoryAILogo.jsx      # Logo component
│   │   ├── lib/
│   │   │   ├── firebase.js          # Firebase initialization
│   │   │   ├── auth.jsx             # Authentication context & hooks
│   │   │   └── projectModel.js      # Data model utilities
│   │   ├── assets/                  # Static images, fonts, etc.
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # React root entry
│   │   └── index.css                # Global styles
│   ├── public/                       # Static files
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   ├── eslint.config.js             # ESLint rules
│   ├── package.json                 # Frontend dependencies
│   └── index.html                   # HTML entry point
│
├── storyai-backend/                 # Backend (Flask + Python)
│   ├── app.py                       # Main Flask application
│   ├── .env                         # Environment variables
│   └── venv/                        # Python virtual environment
│
├── .env.local                       # Local environment variables
├── PROJECT_DOCUMENTATION.md         # Product documentation
└── DEVELOPER_DOCUMENTATION.md       # This file

```

---

## Development Setup

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- Git
- A Hugging Face API key
- Firebase project credentials

### Frontend Setup

```bash
cd storyai
npm install
npm run dev
```

**Environment variables** (`.env.local`):
```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Backend Setup

```bash
cd storyai-backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors python-dotenv huggingface-hub pillow

# Run the server
python app.py
```

**Environment variables** (`.env`):
```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
HF_TEXT_MODEL=MiniMaxAI/MiniMax-M2.7
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
```

### Development Servers

- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Backend**: `http://localhost:5000` (Flask dev server)

---

## Frontend Architecture

### Routing Structure

The application uses **React Router v7** with the following routes:

```
/                           → Landing page (public)
/login                      → Authentication page (public)
/app                        → Protected dashboard (requires auth)
  ├── /app/                 → Project dashboard
  ├── /app/projects/:id     → Storyboard editor
  ├── /app/profile          → User profile
  └── /app/admin            → Admin panel (admin only)
```

### Authentication Context

**File**: `src/lib/auth.jsx`

The `AuthProvider` wraps the entire app and manages:
- User authentication state
- Loading states
- Firebase Auth integration

```javascript
// Usage in any component:
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;
// User is authenticated
```

### State Management

The app uses **React hooks** for state management with **Firestore real-time listeners**:

1. **Local Component State** - UI state (form inputs, dropdowns)
2. **Firebase Firestore** - Persistent project data with real-time sync
3. **React Context** - Global auth state

**No Redux/Zustand** - Firestore acts as the source of truth for application state.

### Component Hierarchy

```
App
├── AuthProvider
│   ├── BrowserRouter
│   │   ├── LandingPage (/)
│   │   ├── AuthPage (/login)
│   │   └── RequireAuth
│   │       └── AppShell (/app/*)
│   │           ├── DashboardPage (/app)
│   │           ├── EditorPage (/app/projects/:id)
│   │           ├── ProfilePage (/app/profile)
│   │           └── AdminPage (/app/admin)
```

### Key Pages

#### Landing Page (`src/pages/Landing.jsx`)
- Public marketing page
- Features showcase
- Pricing table
- Call-to-action buttons
- Navigation header with mobile menu

#### Auth Page (`src/pages/Auth.jsx`)
- Login/signup forms
- Firebase authentication
- Google OAuth integration
- Email/password authentication

#### Dashboard Page (`src/pages/Dashboard.jsx`)
- Project list management
- Search and filtering
- Create/edit/delete projects
- Archive functionality
- Multiple view modes (grid/list)
- Sorting options

#### Editor Page (`src/pages/Editor.jsx`)
- Main storyboarding interface
- Script parsing and shot editing
- AI image generation
- Shot customization (size, angle, lens, etc.)
- Multiple takes management
- Export functionality (PDF, ZIP)

#### Profile Page (`src/pages/Profile.jsx`)
- User account settings
- Email and display name
- Subscription management
- Logout functionality

#### Admin Page (`src/pages/Admin.jsx`)
- User management
- Project moderation
- Analytics and reporting

### Styling

**Tailwind CSS** with custom color scheme:
- **Primary Brand**: `#F27D16` (Orange)
- **Dark Navy**: `#032940` (Dark Blue)
- **Light Gray**: `#F0F0F0` - `#E0E0E0`
- **Text Gray**: `#666666` - `#999999`

Custom fonts configured in `tailwind.config.js`:
- `font-heading` - Bold, branded headings
- `font-body` - Regular body text

---

## Backend Architecture

### Flask Application Structure

**File**: `storyai-backend/app.py`

The backend is a lightweight Flask server that:
1. Proxies requests to Hugging Face models
2. Handles CORS for local development
3. Manages API key security
4. Formats responses for the frontend

### Core Features

#### 1. Health Check Endpoint
```
GET /api/health
```
Returns server status (useful for deployment monitoring).

#### 2. Script Parsing Endpoint
```
POST /api/parse-script
Content-Type: application/json

{
  "script": "STRING: The screenplay text"
}
```

Uses **Hugging Face text model** to:
- Parse script into scenes
- Extract character descriptions
- Generate AI image prompts

#### 3. Image Generation Endpoint
```
POST /api/generate-image
Content-Type: application/json

{
  "prompt": "STRING: Detailed visual prompt"
}
```

Uses **Hugging Face image model** to:
- Generate base64-encoded PNG images
- Apply style filters through prompt engineering
- Return image in base64 format

### Environment Configuration

The backend supports configurable models via `.env`:

```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
HF_TEXT_MODEL=MiniMaxAI/MiniMax-M2.7
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
```

Models can be swapped without code changes:
```python
text_model = os.environ.get("HF_TEXT_MODEL", "MiniMaxAI/MiniMax-M2.7")
image_model = os.environ.get("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell")
```

### Error Handling

API responses follow a consistent format:

**Success**:
```json
{
  "status": "success",
  "data": { /* response data */ }
}
```

**Error**:
```json
{
  "error": "Error message",
  "details": "Technical details",
  "hint": "How to fix"
}
```

### CORS Configuration

Only allows requests from the frontend dev server:
```python
CORS(app, resources={
  r"/api/*": {
    "origins": "http://localhost:5173"
  }
})
```

---

## API Documentation

### Authentication Endpoints

All endpoints below `/api/` require no explicit authentication - the frontend sends user ID via Firestore.

### Parse Script Endpoint

**Endpoint**: `POST /api/parse-script`

**Request**:
```json
{
  "script": "INT. COFFEE SHOP - DAY\n\nJohn sits at a table, sipping coffee. Sarah enters.\n\nSARAH\n(smiling)\nHi John!\n\nJOHN\n(standing)\nSarah! Great to see you."
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "characters": [
      {
        "name": "John",
        "visual_description": "Male, 30s, casual coffee shop attire"
      },
      {
        "name": "Sarah",
        "visual_description": "Female, 30s, friendly expression, casual clothing"
      }
    ],
    "scenes": [
      {
        "caption": "John sits at a coffee shop table, sipping coffee. Sarah enters.",
        "imagePrompt": "Interior coffee shop scene, man sitting at table with coffee cup, warm lighting, cozy atmosphere, realistic style"
      }
    ]
  }
}
```

**Error Response**:
```json
{
  "error": "Backend Error: HUGGINGFACE_API_KEY is missing from your .env file!",
  "hint": "Set HUGGINGFACE_API_KEY in storyai-backend/.env"
}
```

### Generate Image Endpoint

**Endpoint**: `POST /api/generate-image`

**Request**:
```json
{
  "prompt": "wide shot of a futuristic city at night, neon lights, flying cars, cinematic, 8k resolution, highly detailed"
}
```

**Response**:
```json
{
  "status": "success",
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAUA...base64 encoded PNG image..."
}
```

**Error Response**:
```json
{
  "error": "Hugging Face Image API Error",
  "model": "black-forest-labs/FLUX.1-schnell",
  "details": "Model not found",
  "hint": "If this says the model is not supported, set HF_IMAGE_MODEL in storyai-backend/.env"
}
```

### Health Check Endpoint

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "success",
  "message": "StoryAI Python Backend is running on Hugging Face!"
}
```

---

## Data Models & Database

### Firestore Structure

Firestore uses a **hierarchical document structure**:

```
artifacts/
└── storyai-local/  (APP_ID)
    └── users/
        └── {USER_UID}/
            ├── projects/
            │   └── {PROJECT_ID}/
            │       ├── id: string
            │       ├── name: string
            │       ├── script: string
            │       ├── styleId: string (cinematic|african-cinema|pencil|comic|watercolor|noir)
            │       ├── characterRef: string (for AI consistency)
            │       ├── tags: array
            │       ├── archived: boolean
            │       ├── updatedAt: timestamp
            │       └── panels: array
            │           └── {PANEL_OBJECT}
            │               ├── id: string (UUID)
            │               ├── caption: string
            │               ├── prompt: string
            │               ├── imageUrl: string|null
            │               ├── isGenerating: boolean
            │               ├── shotSize: string (close-up|medium|wide|master)
            │               ├── cameraAngle: string (high|eye-level|low|dutch)
            │               ├── lens: string (telephoto|normal|wide)
            │               ├── timeOfDay: string (day|night|sunset|overcast)
            │               ├── notes: string
            │               ├── takes: array
            │               │   ├── id: string (UUID)
            │               │   ├── imageUrl: string
            │               │   └── createdAt: timestamp
            │               ├── selectedTakeId: string
            │               └── selected: boolean
```

### Data Models (Frontend)

#### Project Model

```javascript
{
  id: string,                      // Unique project ID (UUID)
  name: string,                    // Project title
  script: string,                  // Full screenplay text
  styleId: string,                 // Art style (cinematic, african-cinema, etc.)
  characterRef: string,            // Character descriptions for AI consistency
  tags: string[],                  // Search/organization tags
  archived: boolean,               // Soft delete flag
  updatedAt: number,               // Last modification timestamp
  panels: Panel[]                  // Array of storyboard shots
}
```

#### Panel Model

```javascript
{
  id: string,                      // Unique panel ID (UUID)
  caption: string,                 // Shot description (1-2 sentences)
  prompt: string,                  // AI image generation prompt
  imageUrl: string|null,           // Current selected frame image (base64 or URL)
  isGenerating: boolean,           // Generation in-progress flag
  shotSize: string,                // Cinematography: close-up|medium|wide|master
  cameraAngle: string,             // Cinematography: high|eye-level|low|dutch
  lens: string,                    // Cinematography: telephoto|normal|wide
  timeOfDay: string,               // Cinematography: day|night|sunset|overcast
  notes: string,                   // Production notes and details
  takes: Take[],                   // Array of generated image variations
  selectedTakeId: string,          // ID of currently selected take
  selected: boolean                // UI selection state
}
```

#### Take Model

```javascript
{
  id: string,                      // Unique take ID (UUID)
  imageUrl: string,                // Base64-encoded image or CDN URL
  createdAt: number                // Generation timestamp
}
```

### Project Migration

The `migrateProject()` function (in `src/lib/projectModel.js`) handles:
- **Schema updates** - Adds new fields while preserving old data
- **Field mapping** - Maps old field names to new ones (e.g., `imagePrompt` → `prompt`)
- **Default values** - Ensures all fields exist with sensible defaults
- **Data normalization** - Converts data types and structures

```javascript
// Before migration (old format)
{ imagePrompt: "...", panels: [...] }

// After migration (new format)
{ prompt: "...", panels: [...] }
```

---

## Authentication Flow

### Firebase Authentication

The app uses **Firebase Authentication** with multiple providers:

1. **Google OAuth** - Social login via Google
2. **Email/Password** - Traditional credentials
3. **Anonymous** - Optional guest access

### Authentication State Management

```javascript
// Initial Load
App.jsx → AuthProvider → useAuth() Hook
  ↓
Firebase.onAuthStateChanged()
  ↓
User State Updated → Component Re-renders

// Protected Routes
<RequireAuth> → Check if user exists
  ├─ User: Render component
  └─ No user: Redirect to /login
```

### Auth Context Hook

```javascript
import { useAuth } from './lib/auth';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <div>User: {user.email}</div>;
}
```

### User Identification

- **User UID**: `user.uid` - Unique Firebase user ID (used as key in Firestore)
- **Email**: `user.email` - User's email address
- **Display Name**: `user.displayName` - User's chosen display name

---

## Core Workflows

### Workflow 1: Create & Parse Script

**Sequence**:
1. User clicks "New Project" on Dashboard
2. Frontend creates empty project in Firestore
3. User pastes script into editor
4. User clicks "Parse Script"
5. Frontend sends script to backend `/api/parse-script`
6. Backend uses Hugging Face LLM to extract:
   - Character descriptions
   - Scene breakdowns
   - AI-friendly image prompts
7. Response populates project with initial panels
8. Auto-saves to Firestore

**Data Flow**:
```
User Input
    ↓
Editor.jsx (script state)
    ↓
POST /api/parse-script
    ↓
Flask Backend
    ↓
HuggingFace Text Model
    ↓
Parse Response (characters + scenes)
    ↓
Frontend updates project.panels
    ↓
Firestore (auto-save)
```

### Workflow 2: Generate Images

**Sequence**:
1. User selects a panel in editor
2. User customizes shot details (size, angle, lens, etc.)
3. User clicks "Generate"
4. Frontend constructs full prompt from:
   - Base caption/prompt
   - Shot metadata (size, angle, lens)
   - Character reference descriptions
   - Art style suffix
5. Panel state set to `isGenerating: true`
6. Frontend sends to `/api/generate-image`
7. Backend uses Hugging Face image model
8. Response: base64-encoded PNG
9. Save to `panel.takes` array
10. Frontend displays in canvas

**Prompt Construction**:
```javascript
const fullPrompt = `
${basePrompt} (SHOT SIZE: ${shotSize} | CAMERA ANGLE: ${angle} | LENS: ${lens} | TIME OF DAY: ${timeOfDay}).
${styleSuffix}.
CRITICAL CONSISTENCY DETAILS: ${characterRef}
`;
```

**Data Flow**:
```
User clicks "Generate"
    ↓
EditorPage.jsx constructs prompt
    ↓
Sets isGenerating = true
    ↓
POST /api/generate-image
    ↓
Flask Backend
    ↓
Hugging Face Image Model
    ↓
Base64 PNG Image
    ↓
Frontend: setDoc(project.panels[i].takes.push({...}))
    ↓
Firestore Update
    ↓
Canvas Display + UI Refresh
```

### Workflow 3: Export Project

**Sequence**:
1. User clicks "Export" on editor
2. Frontend opens export dialog
3. User selects format:
   - PDF - Single file with all panels
   - ZIP - Individual PNG frames + metadata JSON
4. Frontend generates files using JSZip
5. Browser initiates download

**PDF Export**:
- Uses canvas/HTML rendering
- Creates multi-page PDF with panels
- Includes metadata (shot notes, settings)

**ZIP Export**:
- Creates folder structure: `project-name/frames/`
- Each panel: `frame-001.png`, `frame-002.png`, etc.
- Includes `metadata.json` with project details
- Includes `characters.json` with character reference

---

## Component Guide

### AppShell Component (`src/components/AppShell.jsx`)

Layout wrapper for authenticated app pages.

**Features**:
- Header with navigation and user menu
- Sidebar with project navigation
- Breadcrumbs
- Logout functionality
- Mobile responsive design

### StoryAILogo Component (`src/components/StoryAILogo.jsx`)

SVG logo component used throughout the app.

**Props**: 
- `className` - Tailwind classes for sizing and styling

### Editor Components

The Editor page (`src/pages/Editor.jsx`) contains the main storyboarding interface with:
- **Script textarea** - Input for screenplay
- **Panel canvas** - Grid view of all shots
- **Shot editor** - Controls for individual panel customization
- **Preview area** - Display selected image and takes
- **Export buttons** - PDF and ZIP export options

---

## Deployment Guide

### Frontend Deployment (Vite)

**Build for Production**:
```bash
cd storyai
npm run build
```

Creates optimized bundle in `storyai/dist/`.

**Deployment Options**:

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```
   Auto-deploys on git push. Requires `.env.local` variables configured in project settings.

2. **Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

3. **Docker** (Self-hosted)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=0 /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

### Backend Deployment (Flask)

**Docker Container** (Production):
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

**Generate `requirements.txt`**:
```bash
pip freeze > requirements.txt
```

**Deployment Options**:

1. **Hugging Face Spaces** (Free tier)
   - Push code to HF Spaces
   - Auto-deploys with free GPU access
   - Built-in API endpoint

2. **Railway.app**
   ```bash
   railway link
   railway up
   ```

3. **Google Cloud Run**
   ```bash
   gcloud run deploy storyai-backend --source .
   ```

4. **AWS Lambda + API Gateway**
   - Use Zappa for Flask → Lambda conversion
   - Requires WSGI-compatible framework

### Environment Configuration

**Production Frontend** (`.env.local` or Vercel project settings):
```env
VITE_FIREBASE_API_KEY=prod_key
VITE_FIREBASE_AUTH_DOMAIN=prod.firebaseapp.com
# ... other Firebase variables
```

**Production Backend** (Deployment platform env vars):
```env
HUGGINGFACE_API_KEY=hf_production_key
HF_TEXT_MODEL=MiniMaxAI/MiniMax-M2.7
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
FLASK_ENV=production
```

### CORS Configuration for Production

Update `app.py` for production domain:
```python
CORS(app, resources={
  r"/api/*": {
    "origins": [
      "http://localhost:5173",          # Dev
      "https://yourdomain.com",         # Production
      "https://www.yourdomain.com"
    ]
  }
})
```

---

## Important Notes for Developers

### Real-time Synchronization

Firestore uses **real-time listeners** that auto-sync changes:

```javascript
// Listener automatically updates when Firestore data changes
const unsub = onSnapshot(docRef, (snap) => {
  setProject(snap.data());
});

// Always unsubscribe when component unmounts
useEffect(() => {
  return () => unsub();
}, []);
```

### Auto-save Mechanism

Editor uses debounced saving:
```javascript
const saveTimer = useRef(null);

// Debounce saves to prevent excessive Firestore writes
const saveProject = () => {
  clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(() => {
    setDoc(docRef, projectData);
  }, 1000); // Wait 1s after last edit
};
```

### Image Storage

Images are stored as **base64-encoded strings** in Firestore:
```javascript
// From backend
image_base64 = base64.b64encode(image_bytes).decode('utf-8')

// In frontend, use directly in img src
<img src={`data:image/png;base64,${image_base64}`} />
```

### Style Suffix System

Each art style has a prompt suffix for consistency:

```javascript
const ART_STYLES = [
  { 
    id: 'cinematic', 
    suffix: 'cinematic shot, 35mm lens, 8k resolution, highly detailed, dramatic lighting, movie still' 
  },
  { 
    id: 'pencil', 
    suffix: 'rough pencil sketch, storyboard art, loose lines, monochrome, hand-drawn style' 
  },
  // ... more styles
];

// When generating, append style suffix to prompt
const fullPrompt = `${basePrompt}. ${styleSuffix}`;
```

### UUID Generation

Use native `crypto.randomUUID()` for new IDs:
```javascript
const panelId = crypto.randomUUID();
const takeId = crypto.randomUUID();
```

### Firestore Path Conventions

Always follow this pattern for user-scoped data:
```
artifacts/{APP_ID}/users/{USER_UID}/projects/{PROJECT_ID}
```

Where:
- `APP_ID = 'storyai-local'` (constant)
- `USER_UID` = Firebase auth user ID
- `PROJECT_ID` = UUID or timestamp-based ID

---

## Troubleshooting

### Backend Issues

**Problem**: `HUGGINGFACE_API_KEY is missing`
- **Solution**: Add `HUGGINGFACE_API_KEY` to `.env` file in `storyai-backend/`

**Problem**: Model not found
- **Solution**: Verify model IDs in `.env` match available Hugging Face models
- **Check**: `HF_TEXT_MODEL` and `HF_IMAGE_MODEL` are valid

**Problem**: CORS errors
- **Solution**: Ensure frontend URL is in `CORS()` allow-list in `app.py`

### Frontend Issues

**Problem**: Firebase authentication not working
- **Solution**: Verify `VITE_FIREBASE_*` env vars are correct and match Firebase console

**Problem**: Firestore data not syncing
- **Solution**: Check browser network tab for failed requests
- Enable Firestore offline persistence if needed

**Problem**: Images not displaying
- **Solution**: Verify base64 encoding from backend is valid
- Check browser console for image loading errors

### Development Issues

**Problem**: Hot reload not working
- **Solution**: Ensure Vite dev server is running on port 5173

**Problem**: Port 5000 already in use (Flask)
- **Solution**: Change port in `app.py`:
  ```python
  app.run(debug=True, port=5001)
  ```

---

## Performance Considerations

1. **Image Caching** - Browser caches base64 images (consider CDN for production)
2. **Firestore Reads** - Real-time listeners use read quota; optimize query scope
3. **Hugging Face Rate Limits** - Implement request throttling for image generation
4. **Bundle Size** - Monitor Vite bundle output (`npm run build`), currently ~200KB gzipped
5. **Database Indexes** - Create Firestore indexes for complex queries

---

## Security Best Practices

1. **Never commit secrets** - Use `.env` files (add to `.gitignore`)
2. **Firebase Rules** - Implement security rules to restrict data access:
   ```
   match /artifacts/{database}/users/{uid}/projects/{project} {
     allow read, write: if request.auth.uid == uid;
   }
   ```
3. **CORS validation** - Only allow trusted domains in production
4. **Input validation** - Sanitize user prompts before sending to models
5. **Rate limiting** - Implement on both frontend and backend

---

## Future Enhancement Areas

1. **User Collaboration** - Real-time collaborative editing
2. **Version Control** - Project history and rollback
3. **Advanced Export** - Cinema 4D scene export, DaVinci Resolve integration
4. **Marketplace** - Pre-built storyboard templates and assets
5. **Model Fine-tuning** - Custom model training on user projects
6. **Offline Mode** - Service Worker for offline-first capabilities
7. **Animation** - Generate animated storyboards with camera moves
8. **Mobile App** - Native iOS/Android applications

---

**Last Updated**: April 2026
**Maintained By**: StoryAI Development Team
