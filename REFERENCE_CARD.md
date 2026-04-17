# Deployment Reference Card

**Quick lookup while deploying**

---

## Files Ready for Deployment

✅ `storyai-backend/requirements.txt` - Python packages  
✅ `storyai-backend/Procfile` - Render config  
✅ `storyai-backend/app.py` - Production-ready backend  
✅ `storyai/vercel.json` - Vercel config  
✅ `storyai/vite.config.js` - Optimized frontend build  
✅ `.gitignore` - Secrets protection  

---

## Environment Variables Needed

### Firebase (From Firebase Console)

```
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=storyai-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=storyai-xxx
VITE_FIREBASE_STORAGE_BUCKET=storyai-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Hugging Face (From HF Settings → Tokens)

```
HF_API_KEY=hf_xxxxxxxxxxx
```

### Backend Models (Default values, change if needed)

```
HF_TEXT_MODEL=mistralai/Mistral-7B-Instruct-v0.1
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell
```

### Frontend API URL (Update after backend deployed)

```
VITE_API_BASE_URL=https://storyai-api.onrender.com
```

---

## Services & Their URLs (After Deployment)

| Service | URL Pattern | Example |
|---------|-------|----|
| Frontend | `*.vercel.app` | `https://storyai-app.vercel.app` |
| Backend API | `*.onrender.com` | `https://storyai-api.onrender.com` |
| Health Check | `/api/health` | `https://storyai-api.onrender.com/api/health` |
| Firebase | `console.firebase.google.com` | Configure auth + Firestore |
| Hugging Face | `huggingface.co` | Free models + API |

---

## API Endpoints (Backend)

### Health Check
```
GET /api/health
Response: {"status": "success", "message": "..."}
```

### Parse Script
```
POST /api/parse-script
Body: {"script": "screenplay text here"}
Response: {"status": "success", "data": {"characters": [...], "scenes": [...]}}
```

### Generate Image
```
POST /api/generate-image
Body: {"prompt": "detailed image description"}
Response: {"status": "success", "image_base64": "data:image/png;base64,..."}
```

---

## CORS Configuration (Already Set)

✅ Allows:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5000`
- `https://storyai-app.vercel.app`
- `https://*.vercel.app`
- Custom origin from `FRONTEND_URL` env var

---

## Deployment Steps Summary

### Phase 1: GitHub Setup
1. Push code to GitHub
2. Ensure `.gitignore` protects `.env` files

### Phase 2: Frontend (Vercel)
1. Sign up with GitHub
2. Import StoryBoardsApp repo
3. Set root directory: `storyai`
4. Add Firebase environment variables
5. Deploy
6. **Save URL**

### Phase 3: Backend (Render)
1. Sign up with GitHub
2. Create Web Service
3. Set root directory: `storyai-backend`
4. Add HF_API_KEY, model, and FRONTEND_URL variables
5. Deploy
6. **Save URL**

### Phase 4: Connect
1. Update `VITE_API_BASE_URL` in Vercel to Render URL
2. Redeploy Vercel
3. Test that API calls work

### Phase 5: Test Everything
1. Load frontend URL
2. Sign in
3. Create project
4. Upload script
5. Generate image
6. Export PDF

---

## Troubleshooting Quick Links

| Issue | Check |
|-------|-------|
| Frontend blank | Browser console (F12), Vercel logs |
| Can't sign in | Firebase auth enabled, domain in Firebase |
| API 404 error | Backend deployed, URL set in Vercel |
| CORS error | Already fixed, check logs |
| Timeout | Normal on first request (cold start) |
| Image gen slow | 20-30 seconds normal, wait longer |

---

## Important Commands

### Test Backend Locally
```bash
cd storyai-backend
pip install -r requirements.txt
python app.py
# Visit http://localhost:5000/api/health
```

### Test Frontend Locally
```bash
cd storyai
npm install
npm run dev
# Visit http://localhost:5173
```

### Build Frontend
```bash
cd storyai
npm run build
# Creates dist/ directory
```

### Push Changes to GitHub
```bash
git add .
git commit -m "message"
git push origin main
```

---

## Free Tier Limits

| Service | Limit | Impact |
|---------|-------|--------|
| Vercel | 100GB bandwidth/mo | ✓ Plenty |
| Render | 750hrs/mo | ✓ Runs continuously |
| Firebase | 50k ops/day | ✓ ~2k users/day |
| HF API | Free tier | ✓ Available |

---

## Success Checklist

- [ ] GitHub repo created and code pushed
- [ ] Firebase project created and configured
- [ ] Firebase authentication enabled (Email + Google)
- [ ] Hugging Face account created with API key
- [ ] Vercel frontend deployed
- [ ] Render backend deployed
- [ ] API URL connected in Vercel
- [ ] Frontend loads at vercel.app URL
- [ ] Can sign in with email or Google
- [ ] Can upload script and parse it
- [ ] Can generate images
- [ ] Can export storyboard
- [ ] Projects persist in Firebase

---

## Need Help?

1. **Detailed Guide:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Step-by-Step:** See [IMPLEMENTATION_STEPS.md](./IMPLEMENTATION_STEPS.md)  
3. **Quick Reference:** See [QUICKSTART_DEPLOY.md](./QUICKSTART_DEPLOY.md)
4. **Status Check:** See [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)

---

## Deployment Dashboard Links (Save These!)

**After Deployment:**

```
Vercel: https://vercel.com/dashboard
Render: https://dashboard.render.com
Firebase: https://console.firebase.google.com
GitHub: https://github.com/YOUR_USERNAME/StoryBoardsApp
```

---

**You're ready to deploy! Follow IMPLEMENTATION_STEPS.md in order.** 🚀
