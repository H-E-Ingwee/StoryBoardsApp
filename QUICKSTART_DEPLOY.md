# QuickStart: Deploy StoryAI in 20 Minutes

**Fast-track deployment guide with minimal reading**

---

## What You'll Need

- GitHub account (free)
- Vercel account (free)
- Render account (free) 
- Hugging Face API key
- Firebase credentials
- 20 minutes of time

---

## 5-Minute Setup

### 1. GitHub: Push Your Code

```bash
cd c:\Users\mutcu\OneDrive\Documents\GitHub\StoryBoardsApp
git add .
git commit -m "Deploy to production"
git push origin main
```

### 2. Firebase: Get Your Credentials

1. Go to https://console.firebase.google.com
2. Click Project Settings (⚙️)
3. Scroll to "Your apps" → Copy Web config
4. **Save these values** (you'll need them):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 3. Hugging Face: Get API Key

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Copy token value
4. **Save this value**

---

## Frontend Deployment (Vercel): 5 minutes

### Step 1: Sign Up
```
https://vercel.com/signup
→ "Continue with GitHub"
```

### Step 2: Import Project
```
Dashboard → Add New → Project
→ Select StoryBoardsApp
→ Root Directory: storyai
→ Click Deploy
```

### Step 3: Add Environment Variables

In Vercel project settings, add these:

| Key | Value |
|-----|-------|
| `VITE_FIREBASE_API_KEY` | (from Firebase config) |
| `VITE_FIREBASE_AUTH_DOMAIN` | (from Firebase config) |
| `VITE_FIREBASE_PROJECT_ID` | (from Firebase config) |
| `VITE_FIREBASE_STORAGE_BUCKET` | (from Firebase config) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (from Firebase config) |
| `VITE_FIREBASE_APP_ID` | (from Firebase config) |
| `VITE_API_BASE_URL` | `https://placeholder.onrender.com` |

**Wait 2-3 minutes for deployment to complete.**

### Step 4: Get Your URL

Vercel gives you URL like: `https://storyai-app.vercel.app`

**Save this!**

---

## Backend Deployment (Render): 5 minutes

### Step 1: Sign Up
```
https://render.com/signup
→ "Sign up with GitHub"
```

### Step 2: Create Service
```
Dashboard → New + → Web Service
→ Select StoryBoardsApp
→ Root Directory: storyai-backend
```

### Step 3: Configure
| Setting | Value |
|---------|-------|
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Instance Type | **Free** |

### Step 4: Add Environment Variables

| Key | Value |
|-----|-------|
| `HF_API_KEY` | (your Hugging Face key) |
| `HF_TEXT_MODEL` | `mistralai/Mistral-7B-Instruct-v0.1` |
| `HF_IMAGE_MODEL` | `black-forest-labs/FLUX.1-schnell` |
| `FRONTEND_URL` | `https://storyai-app.vercel.app` |

Click "Create Web Service"

**Wait 5-10 minutes for build to complete.**

### Step 5: Get Your URL

Render gives you URL like: `https://storyai-api.onrender.com`

**Save this!**

### Step 6: Verify Backend Works

Visit: `https://storyai-api.onrender.com/api/health`

Should return JSON with `"status": "success"`

---

## Connect Frontend to Backend: 2 minutes

### Update Vercel Environment Variable

1. Vercel Dashboard → storyai-app project
2. Settings → Environment Variables
3. Find `VITE_API_BASE_URL`
4. Change to: `https://storyai-api.onrender.com`
5. Save and **Redeploy**

---

## Test Everything

| Test | Steps | Expected |
|------|-------|----------|
| **Frontend Loads** | Visit vercel URL | Page appears |
| **Sign In** | Click "Sign In" → Auth | Firebase login works |
| **Script Upload** | Create project → Upload script | Shows parsed shots |
| **Image Gen** | Click Generate | Image appears (30-50 sec) |
| **Export** | Click Export | PDF downloads |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Frontend blank | Refresh page, check console (F12) |
| Can't sign in | Check Firebase credentials in Vercel |
| API returns 404 | Check backend URL in Vercel env vars |
| Image gen timeout | Wait 60s, check Render logs |
| CORS error | Backend CORS already configured |

---

## URLs to Save

```
Frontend:        https://storyai-app.vercel.app
Backend API:     https://storyai-api.onrender.com
Vercel Dash:     https://vercel.com/dashboard
Render Dash:     https://dashboard.render.com
Firebase:        https://console.firebase.google.com
```

---

## Done! 🚀

Your app is live. Now:

1. Share frontend URL with others
2. They can sign up and create storyboards
3. Monitor dashboards for errors
4. Plan upgrades when hitting free tier limits

---

For detailed explanation, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
