# StoryAI Deployment Implementation Steps

**Follow these steps to deploy your app to the internet**

---

## Phase 1: Prerequisites & Setup (5-10 minutes)

### Step 1.1: Create GitHub Account & Push Code

1. **If you don't have GitHub:**
   - Go to https://github.com/join
   - Sign up with your email
   - Verify your email address

2. **Push your code to GitHub:**
   ```bash
   # Navigate to your project
   cd c:\Users\mutcu\OneDrive\Documents\GitHub\StoryBoardsApp

   # Initialize git (if not already done)
   git init

   # Add all files
   git add .

   # Commit
   git commit -m "Initial StoryAI commit - ready for deployment"

   # If you already have a GitHub repo, add it as remote
   # Replace YOUR_USERNAME and REPO_NAME with your actual values
   git remote add origin https://github.com/YOUR_USERNAME/StoryBoardsApp.git
   git branch -M main
   git push -u origin main
   ```

3. **Verify on GitHub:**
   - Go to https://github.com/YOUR_USERNAME/StoryBoardsApp
   - You should see all your files uploaded

### Step 1.2: Get Your Firebase Credentials

Your Firebase credentials are critical. Find them:

1. Go to https://console.firebase.google.com
2. Click your project (if you have one) or create new one:
   - Click "Create a project"
   - Name it "StoryAI"
   - Accept terms and create
3. Go to **Project Settings** (gear icon)
4. Scroll to **"Your apps"** section
5. Look for your **Web** app
6. Click the copy icon or view config
7. Copy these values:
   ```
   VITE_FIREBASE_API_KEY=<your_value>
   VITE_FIREBASE_AUTH_DOMAIN=<your_value>
   VITE_FIREBASE_PROJECT_ID=<your_value>
   VITE_FIREBASE_STORAGE_BUCKET=<your_value>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your_value>
   VITE_FIREBASE_APP_ID=<your_value>
   ```
8. **Save these in a text file** - you'll need them soon

### Step 1.3: Get Your Hugging Face API Key

1. Go to https://huggingface.co/join (create account if needed)
2. After signup, go to **Settings** → **Access Tokens**
3. Click **"New token"**
4. Name it: `StoryAI-Deployment`
5. Choose **"Read"** access level
6. Click **"Create token"**
7. Copy the token and **save it** in your text file

---

## Phase 2: Frontend Deployment on Vercel (5 minutes)

### Step 2.1: Sign Up for Vercel

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Fill in your name and confirm email

### Step 2.2: Import Your Project

1. After login, you'll see the dashboard
2. Click **"Add New..."** → **"Project"**
3. Look for **StoryBoardsApp** in your repositories list
4. Click **"Import"**

### Step 2.3: Configure Build Settings

When the import screen appears:

1. **Project Name**: `storyai-app` (or your choice)
2. **Framework**: Should auto-detect as "React" ✓
3. **Root Directory**: Click and select `storyai`
4. **Build and Output Settings**:
   - Build Command: `npm run build` ✓
   - Output Directory: `dist` ✓
   - Install Command: `npm install` ✓

### Step 2.4: Add Environment Variables

1. Scroll down to **"Environment Variables"** section
2. Add each Firebase variable:
   ```
   VITE_FIREBASE_API_KEY = <your_value>
   VITE_FIREBASE_AUTH_DOMAIN = <your_value>
   VITE_FIREBASE_PROJECT_ID = <your_value>
   VITE_FIREBASE_STORAGE_BUCKET = <your_value>
   VITE_FIREBASE_MESSAGING_SENDER_ID = <your_value>
   VITE_FIREBASE_APP_ID = <your_value>
   VITE_API_BASE_URL = https://placeholder.onrender.com
   ```
   (You'll update the last one after backend is deployed)

3. For each variable:
   - Paste the key name (e.g., `VITE_FIREBASE_API_KEY`)
   - Paste the value
   - Click **"Add"**

4. When done, click **"Deploy"**

### Step 2.5: Wait for Build

- Vercel will start building
- This takes 2-3 minutes
- You'll see a **"Deployment complete!"** message
- You'll get a URL like: `https://storyai-app.vercel.app`

**Save this URL** - you'll need it for the backend CORS settings.

### Test Frontend Deployment

1. Visit your Vercel URL (e.g., `https://storyai-app.vercel.app`)
2. Verify:
   - ✅ Page loads (no blank screen)
   - ✅ Navigation works
   - ✅ Can click "Sign In"
3. **Expected**: Firebase login will work, but API calls will fail (backend not deployed yet)

---

## Phase 3: Backend Deployment on Render (10 minutes)

### Step 3.1: Sign Up for Render

1. Go to https://render.com/signup
2. Click **"Sign up with GitHub"**
3. Authorize Render to access your GitHub
4. Confirm your email

### Step 3.2: Create Web Service

1. After login, click **"New +"**
2. Select **"Web Service"**
3. Find and select **StoryBoardsApp** repository
4. Click **"Connect"**

### Step 3.3: Configure Web Service

Fill in the configuration form:

1. **Name**: `storyai-api`
2. **Environment**: `Python 3`
3. **Region**: Leave as default (auto-selects closest)
4. **Branch**: `main`
5. **Root Directory**: `storyai-backend`
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `gunicorn app:app`
8. **Instance Type**: Select **"Free"** tier

### Step 3.4: Add Environment Variables

1. Scroll to **"Environment"** section
2. Click **"Add Environment Variable"**
3. Add these variables:

```
HF_API_KEY = <your_hugging_face_token>
HF_TEXT_MODEL = mistralai/Mistral-7B-Instruct-v0.1
HF_IMAGE_MODEL = black-forest-labs/FLUX.1-schnell
FRONTEND_URL = https://storyai-app.vercel.app
```

**How to add each:**
1. Type key name (e.g., `HF_API_KEY`)
2. Type value
3. Click **"Add"**
4. Repeat for all 4 variables

### Step 3.5: Deploy

1. Click **"Create Web Service"**
2. Render will start building (this takes 5-10 minutes)
3. Watch the **"Build"** section for progress
4. When complete, you'll get a URL like: `https://storyai-api.onrender.com`

**Save this URL** - you'll use it to update frontend settings.

### Test Backend Deployment

1. Visit: `https://storyai-api.onrender.com/api/health`
2. Expected response:
   ```json
   {
     "status": "success",
     "message": "StoryAI Python Backend is running on Hugging Face!"
   }
   ```
3. If you see this, ✅ backend is working!

**Note**: First requests may take 30-50 seconds (cold start on free tier). This is normal.

---

## Phase 4: Connect Frontend to Backend (2 minutes)

### Step 4.1: Update Frontend Environment Variable

1. Go to https://vercel.com and login
2. Click your **storyai-app** project
3. Go to **Settings** → **Environment Variables**
4. Find or add: `VITE_API_BASE_URL`
5. Change the value to your Render URL:
   ```
   https://storyai-api.onrender.com
   ```
6. Click **"Save"**

### Step 4.2: Redeploy Frontend

1. In Vercel, click **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu
4. Click **"Redeploy"**
5. Wait for build to complete

### Step 4.3: Verify Connection

1. Visit your frontend URL: `https://storyai-app.vercel.app`
2. Log in
3. Go to Dashboard
4. Create a new project
5. Upload a test script
6. Check browser DevTools (F12):
   - Open **Network** tab
   - Look for `/api/parse-script` request
   - Should get **200 response** (not 404 or CORS error)

---

## Phase 5: Full System Testing (5-10 minutes)

### Test 1: Complete Auth Flow

- [ ] Visit landing page ✓
- [ ] Click "Sign In" ✓
- [ ] Authenticate with email or Google ✓
- [ ] Redirected to dashboard ✓
- [ ] Can see projects list ✓

### Test 2: Script Upload & Parsing

- [ ] Create new project ✓
- [ ] Upload test screenplay ✓
- [ ] See parsed scenes/shots ✓
- [ ] Can edit shot descriptions ✓

### Test 3: Image Generation

- [ ] In Editor, customize a shot ✓
- [ ] Click "Generate Image" ✓
- [ ] Image appears (may take 20-30 seconds) ✓
- [ ] Can see multiple takes ✓
- [ ] Can select favorite take ✓

### Test 4: Export

- [ ] Click "Export" ✓
- [ ] Download PDF ✓
- [ ] PDF opens and shows storyboard ✓

### Test 5: Team Collaboration (if on Creator+ plan)

- [ ] Go to project settings ✓
- [ ] Click "Share" ✓
- [ ] Invite another user ✓
- [ ] Check they can view/edit ✓

---

## Phase 6: Troubleshooting (if needed)

### Issue: Frontend loads blank page

**Solution:**
1. Check browser console (F12 → Console tab)
2. Look for red error messages
3. Verify Firebase variables are set correctly in Vercel
4. Try: Vercel dashboard → Redeploy

### Issue: Can't sign in

**Solution:**
1. Check Firebase is properly configured
2. Go to Firebase Console → Authentication
3. Enable "Email/Password" provider
4. Enable "Google" provider
5. Add your Vercel URL to authorized domains:
   - Firebase Console → Settings → Authorized domains
   - Add: `storyai-app.vercel.app`

### Issue: API calls return 404

**Solution:**
1. Check Render backend is running:
   - Visit `/api/health` endpoint
   - Should return JSON response
2. Check frontend has correct API URL:
   - Vercel → Settings → Environment Variables
   - Verify `VITE_API_BASE_URL` is correct Render URL
3. Redeploy frontend after changing variables

### Issue: Image generation fails with timeout

**Solution:**
1. This is normal on free tier (first requests take 30-50 seconds)
2. Wait longer (up to 60 seconds)
3. If still fails, check:
   - Render logs for errors
   - Hugging Face API key is valid
   - Hugging Face account has access to models

### Issue: Can't find something in dashboard

**Solution:**
1. Refresh page (Ctrl+F5 to hard refresh)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check browser console for JavaScript errors
4. Try different browser (Chrome, Firefox, etc.)

---

## Phase 7: Optional Enhancements

### Add Custom Domain

**For Vercel:**
1. Vercel project → Settings → Domains
2. Add your domain (requires DNS changes)
3. Follow Vercel's DNS setup instructions

**For Render:**
1. Render service → Settings → Custom Domain
2. Similar DNS setup process

### Enable HTTPS/SSL

- Already enabled! Both Vercel and Render provide free SSL certificates

### Set Up Email Notifications

**Vercel:**
1. Settings → Notifications
2. Enable for deployments and errors

**Render:**
1. Account → Notifications
2. Get alerts for service issues

### Monitor Usage

**Vercel Analytics:**
- Vercel → Analytics tab
- See traffic and performance

**Render Metrics:**
- Render dashboard → Metrics
- Monitor CPU, memory, bandwidth

---

## Success Checklist

Before considering deployment complete:

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Environment variables set on both services
- [ ] Frontend can reach backend API
- [ ] User authentication works
- [ ] Script parsing works
- [ ] Image generation works
- [ ] Projects save to Firebase
- [ ] Can export storyboard
- [ ] All services have HTTPS (secure)

---

## Your Live URLs

After deployment, save these:

```
Frontend: https://storyai-app.vercel.app
Backend API: https://storyai-api.onrender.com
Admin Dashboard: https://console.firebase.google.com
Vercel Dashboard: https://vercel.com/dashboard
Render Dashboard: https://dashboard.render.com
```

---

## Next Steps After Going Live

1. **Monitor Performance**
   - Check error rates in both dashboards
   - Monitor Firebase usage
   - Watch Hugging Face API billing

2. **Gather User Feedback**
   - Share with friends/colleagues
   - Get feedback on UI/UX
   - Note any bugs or issues

3. **Plan Scaling**
   - Monitor free tier limits
   - Plan upgrade path if needed
   - Consider paid tiers

4. **Keep Updated**
   - Check for dependency updates
   - Security patches
   - Feature improvements

---

**Congratulations! Your StoryAI app is now live on the internet! 🚀**

For help or questions, refer to:
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed explanations
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Firebase Docs: https://firebase.google.com/docs
