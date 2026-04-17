# StoryAI - Creative Studio Documentation

## Executive Summary

**StoryAI** is an AI-powered creative studio platform that transforms scripts into professional storyboards. It enables creators, producers, and production teams to automatically parse screenplays, customize shots, generate AI-powered frames, and collaborate on visual storytelling—all in one unified interface.

The platform combines intelligent script parsing, cinematography controls, AI generation, and team collaboration features to streamline the storyboarding workflow.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [User Experience Flow](#user-experience-flow)
7. [Design System](#design-system)
8. [Core Components](#core-components)
9. [Setup & Installation](#setup--installation)
10. [API Documentation](#api-documentation)
11. [Data Models](#data-models)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

### Vision
To democratize professional storyboarding by providing an intelligent, user-friendly platform that reduces production time while maintaining creative control and quality standards.

### Target Users
- **Individual Creators**: Filmmakers, animators, and content creators
- **Production Teams**: Studios and agencies managing complex projects
- **Directors**: Professionals who need fast, accurate visual planning
- **Producers**: Team leads coordinating production workflows

### Value Proposition
- **Speed**: Convert scripts to storyboards in minutes, not days
- **Quality**: AI-assisted generation with creative control
- **Collaboration**: Team features for seamless coordination
- **Affordability**: Tiered pricing accessible to all creators
- **Ease of Use**: Intuitive interface designed for creative professionals

---

## Key Features

### 1. Script-to-Shots Parsing
- **Intelligent Detection**: Automatically identifies scenes, shots, and action sequences
- **Customizable Breakdown**: Edit shot descriptions and add cinematography details
- **AI-Assisted**: Leverages HuggingFace Inference API for smart parsing
- **Plain Language**: Generates creator-friendly descriptions and notes

### 2. Shot Editor & Customization
- **Detailed Controls**: Lens type, camera angles, lighting presets, depth of field
- **Character Consistency**: Maintain character notes and visual consistency
- **Production Metadata**: Add timing, notes, and production-specific information
- **Visual Inspector Panel**: Real-time preview and editing interface

### 3. AI Frame Generation
- **Batch Processing**: Generate multiple takes per shot
- **FLUX.1 Integration**: State-of-the-art image generation
- **Unlimited Retries**: Iterate until perfect results
- **Quality Selection**: Choose best takes from multiple generations

### 4. Project Management
- **Dashboard View**: Grid and list view modes for project browsing
- **Search & Filter**: Find projects by name, date, or status
- **Archival System**: Organize active and archived projects
- **Project Duplication**: Clone and modify existing storyboards

### 5. Team Collaboration
- **Creator Profiles**: Individual workspace management
- **Shareable Links**: Quick project sharing with collaborators
- **Role-Based Access**: Admin controls for team management
- **Real-Time Updates**: Firebase Firestore for instant sync

### 6. Export & Sharing
- **Multiple Formats**: PDF, CSV, and custom formats
- **Batch Export**: Export entire storyboards with metadata
- **Professional Layout**: Studio-ready output formatting
- **Social Sharing**: Direct integration for social media

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Landing     │  │  Dashboard   │  │  Project Editor │   │
│  │  Page        │  │  & Management│  │  & Inspector    │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘   │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          │ HTTP/REST APIs   │ Real-time Updates
          │                  │ (Firestore)
┌─────────┼──────────────────┼──────────────────┼──────────────┐
│         │                  │                  │              │
│  ┌──────▼────────┐  ┌──────▼────────┐  ┌────▼──────────┐   │
│  │ Backend API   │  │  Firebase     │  │ HuggingFace   │   │
│  │ (Flask Python)│  │  Firestore    │  │ Inference API │   │
│  └──────┬────────┘  │ & Auth        │  │ - Text Model  │   │
│         │           │               │  │ - Image Model │   │
│         │           └───────────────┘  └───────────────┘   │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────┐            │
│  │         External Services                   │            │
│  │ - HuggingFace Hub (Script Parsing & Images) │            │
│  │ - Google Firebase (Auth & Database)         │            │
│  └───────────────────────────────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

**Script Upload → Parse → Customize → Generate → Export**

1. **Upload**: Creator pastes screenplay into script editor
2. **Parse**: Backend uses HF text model to break down into shots
3. **Customize**: Creator edits shots, adds cinematography details
4. **Generate**: AI generates frames using FLUX.1 model
5. **Refine**: Creator selects best takes and makes adjustments
6. **Export**: Download storyboard in desired format

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI framework with hooks |
| Vite | Latest | Build tool with HMR |
| Tailwind CSS | Latest | Utility-first styling |
| React Router | Latest | Client-side routing |
| Lucide React | Latest | Icon library |
| Firebase SDK | Latest | Real-time database & auth |

### Backend
| Technology | Purpose |
|-----------|---------|
| Flask | REST API framework |
| Python 3.9+ | Backend runtime |
| HuggingFace Hub | AI/ML inference |
| CORS | Cross-origin requests |
| Python-dotenv | Environment management |

### Cloud & Services
| Service | Purpose |
|---------|---------|
| Google Firebase | Authentication, Firestore DB |
| HuggingFace Inference API | Script parsing & image generation |
| FLUX.1 Model | State-of-the-art image generation |
| MiniMax-M2.7 | Advanced text understanding |

### Development Tools
| Tool | Purpose |
|------|---------|
| Git | Version control |
| ESLint | Code quality |
| PostCSS | CSS processing |
| Node Package Manager | Dependency management |

---

## Project Structure

```
StoryBoardsApp/
├── storyai/                          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Marketing landing page
│   │   │   ├── Dashboard.jsx        # Project management dashboard
│   │   │   ├── Login.jsx            # Authentication
│   │   │   └── ProjectEditor.jsx    # Main editor & inspector
│   │   ├── components/
│   │   │   ├── StoryAILogo.jsx      # Branding component
│   │   │   ├── ActionButton.jsx     # Reusable button styles
│   │   │   └── [other components]
│   │   ├── lib/
│   │   │   ├── firebase.js          # Firebase config
│   │   │   ├── auth.js              # Authentication logic
│   │   │   └── projectModel.js      # Data transformations
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   ├── App.css                  # Global styles
│   │   └── index.css                # Base styles
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind customization
│   ├── postcss.config.js
│   └── eslint.config.js
│
├── storyai-backend/                  # Python backend
│   ├── app.py                       # Flask API
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Environment variables
│
└── PROJECT_DOCUMENTATION.md         # This file

```

---

## User Experience Flow

### 1. Landing Page Flow
```
User Arrives
    ↓
Browse Features & Pricing
    ↓
Sign Up / Log In
    ↓
Dashboard
```

**Key Sections**:
- Hero section with clear value proposition
- Feature cards highlighting key capabilities
- How It Works (3-step process)
- Transparent pricing with featured tier
- CTA sections with clear next steps

### 2. Dashboard Flow
```
Dashboard
    ├── Active Projects Tab
    │   ├── Search & Filter
    │   ├── View Toggle (Grid/List)
    │   ├── Sort Options
    │   └── Project Card → [Open/Duplicate/Archive/Delete]
    │
    ├── Archived Projects Tab
    │   └── [Similar options]
    │
    └── Create New Project Button
        └── Project Editor
```

**Dashboard Features**:
- Real-time project list with Firestore
- Multiple view modes (grid/list)
- Advanced filtering (active/archived)
- Project actions (open, duplicate, archive, delete)
- Toast notifications for actions

### 3. Editor Flow
```
Project Editor
    ├── Script Input Section
    │   ├── Paste screenplay
    │   └── "Break into shots" button
    │
    ├── Style & Consistency Panel
    │   ├── Visual theme selection
    │   └── Character notes
    │
    ├── Shot Board (Center Canvas)
    │   ├── Auto-generated shots
    │   ├── Editable shot details
    │   └── Metadata management
    │
    └── Inspector Panel (Right)
        ├── Shot details & takes
        ├── AI-generated frames
        ├── Customization options
        └── Export actions
```

---

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Navy** | #032940 | Headers, primary text, buttons |
| **Orange Accent** | #F27D16 | CTAs, highlights, hover states |
| **Dark Orange** | #d86b10 | Hover states on primary buttons |
| **Light Background** | #F9F9F9 | Page backgrounds |
| **Card White** | #FFFFFF | Cards, modals, containers |
| **Border Gray** | #E0E0E0 | Borders, dividers |
| **Body Text** | #666666 | Body copy, descriptions |
| **Light Text** | #999999 | Secondary text, placeholders |
| **Error Red** | #730E20 | Error states, delete actions |
| **Disabled Gray** | #CCCCCC | Disabled elements |

### Typography
- **Font Family**: Inter, system sans-serif
- **Heading Class**: `font-heading` (bold, uppercase for emphasis)
- **Body Class**: `font-body` (readable, balanced)
- **Font Weights**: 
  - Black (900) for headings
  - Bold (700) for emphasis
  - Semibold (600) for secondary text
  - Regular (400) for body

### Component Patterns

#### Buttons
```
Solid (Primary): Orange bg, white text, shadow, scale on hover
Ghost (Secondary): Transparent, outline, no shadow
Danger: Red text, red border, red hover background
```

#### Cards
- White background
- Subtle border (#E0E0E0)
- Soft shadow on rest, enhanced on hover
- Smooth transitions (300ms duration)
- Gradient top border on hover (navy→orange)

#### Input Fields
- Clean white background
- Subtle gray border
- Blue focus ring on interaction
- Full-width for responsive design

### Spacing Scale
- **Base unit**: 4px (Tailwind default)
- **Common**: p-5, py-4, px-6, gap-4, mb-6
- **Sections**: py-20 (desktop), py-8 lg:py-12 (mobile/responsive)

### Responsive Design
- **Mobile-first approach**
- **Breakpoints**: 
  - md: 768px (tablets)
  - lg: 1024px (desktop)
  - xl: 1280px (large screens)

---

## Core Components

### Frontend Components

#### 1. Landing Page (`pages/Landing.jsx`)
```jsx
Exports: LandingPage()
Sections:
- FeatureCard: Icon badge with hover lift
- PricingCard: Tiered pricing with featured variant
- Header: Fixed, scroll-aware navigation
- Hero: Value proposition with CTA
- Features: 4-column grid
- How It Works: 3-step process
- Pricing: 3-tier comparison
- Footer: Links and branding
```

#### 2. Dashboard (`pages/Dashboard.jsx`)
```jsx
Exports: DashboardPage()
Features:
- State Management: Projects[], view, viewMode, sortBy, query
- Real-time Updates: Firebase onSnapshot
- Search & Filter: Memoized filtering
- View Modes: Grid (3-col) and list view
- Actions: Open, duplicate, archive, delete
- Toast Notifications: Auto-dismiss (2.8s)
```

#### 3. ActionButton Component
```jsx
Props: { onClick, icon, label, variant }
Variants:
- 'solid': Orange button (primary action)
- 'ghost': Transparent button (secondary)
- 'danger': Red button (destructive)
```

### Backend Endpoints

#### Parse Script
```
POST /api/parse-script
Content-Type: application/json

Request:
{
  "script": "INT. COFFEE SHOP - DAY\n..."
}

Response:
{
  "shots": [
    {
      "shotNumber": 1,
      "sceneHeading": "INT. COFFEE SHOP",
      "description": "...",
      "cinematography": "...",
      "characters": ["..."]
    }
  ]
}
```

#### Generate Images
```
POST /api/generate-image
Content-Type: application/json

Request:
{
  "prompt": "Shot description",
  "style": "cinematic"
}

Response:
{
  "image": "base64_encoded_image",
  "metadata": { ... }
}
```

---

## Data Models

### Project Model
```javascript
Project {
  id: UUID,
  name: string,
  script: string,
  styleId: 'cinematic' | 'animated' | 'comic',
  characterRef: string,
  panels: Panel[],
  tags: string[],
  archived: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Metadata
  owner: userId,
  collaborators: userId[],
  visibility: 'private' | 'shared' | 'public'
}
```

### Panel Model (Shot)
```javascript
Panel {
  id: UUID,
  shotNumber: number,
  sceneHeading: string,
  description: string,
  cinematography: {
    lens: string,
    angle: string,
    lighting: string,
    depthOfField: string
  },
  characters: string[],
  takes: Take[],
  notes: string,
  duration: number (seconds)
}
```

### Take Model (Generated Frame)
```javascript
Take {
  id: UUID,
  imageUrl: string,
  generatedAt: timestamp,
  prompt: string,
  quality: 'draft' | 'final',
  selected: boolean
}
```

---

## Setup & Installation

### Prerequisites
- Node.js 16+
- Python 3.9+
- Git
- Firebase account
- HuggingFace API key

### Frontend Setup

```bash
# Navigate to frontend directory
cd storyai

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
EOF

# Start development server
npm run dev
# Opens at http://localhost:5173
```

### Backend Setup

```bash
# Navigate to backend directory
cd storyai-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
HUGGINGFACE_API_KEY=your_hf_api_key
GEMINI_API_KEY=your_gemini_key
HF_TEXT_MODEL=MiniMaxAI/MiniMax-M2.7
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
FLASK_ENV=development
EOF

# Run Flask server
python app.py
# Runs on http://localhost:5000
```

### Firebase Setup

1. Create Firebase project at console.firebase.google.com
2. Enable Authentication (Google, Email/Password)
3. Create Firestore Database
4. Set security rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/projects/{projectId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

5. Copy Firebase config to frontend `.env.local`

---

## API Documentation

### Authentication
- **Type**: Firebase Auth
- **Methods**: Email/Password, Google OAuth
- **Token**: Auto-managed by Firebase SDK

### REST Endpoints

#### Health Check
```
GET /api/health
Response: { "status": "success" }
```

#### Parse Script
```
POST /api/parse-script
Request: { "script": "..." }
Response: { "shots": [...] }
```

#### Generate Image
```
POST /api/generate-image
Request: { "prompt": "...", "style": "..." }
Response: { "image": "base64...", "metadata": {...} }
```

#### Real-time Data
- **Firestore Collections**: 
  - `artifacts/{APP_ID}/users/{userId}/projects`
  - Uses `onSnapshot()` for real-time updates

---

## Future Enhancements

### Phase 2 (Next Quarter)
- [ ] Multi-user collaboration with real-time cursors
- [ ] Advanced shot library with pre-made templates
- [ ] Integration with Premiere Pro / Final Cut Pro
- [ ] Advanced AI models (character recognition, scene analysis)
- [ ] Version history and rollback functionality

### Phase 3 (Long-term)
- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Team workspace management
- [ ] Custom AI model training
- [ ] API for third-party integrations
- [ ] Offline-first capability with sync

### Performance Optimizations
- [ ] Image caching and CDN integration
- [ ] Lazy loading for project lists
- [ ] Service Workers for offline support
- [ ] Database query optimization

---

## Getting Help & Support

### Documentation
- **Frontend**: See `storyai/` README
- **Backend**: See `storyai-backend/` README
- **Issues**: GitHub Issues for bug reports

### Contact
- **Email**: support@storyai.studio
- **Documentation Site**: docs.storyai.studio

---

## License & Credits

**Project**: StoryAI Creative Studio
**Status**: Active Development
**Last Updated**: April 2026

### Key Technologies
- Built with React, Vite, Tailwind CSS
- Powered by HuggingFace Inference API
- Database by Google Firebase
- UI Icons from Lucide React

---

## Appendix

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Esc` | Close menus/modals |
| `Cmd/Ctrl + S` | Save project |
| `Cmd/Ctrl + /` | Toggle command palette |

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Targets
- Landing page: < 2s first paint
- Dashboard load: < 1.5s
- Editor load: < 2.5s
- Image generation: 30-60s (HF inference)

---

**End of Documentation**
