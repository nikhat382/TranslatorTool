# 🚀 Translatrix Pro - Deployment Guide

## ✅ Current Architecture

- **Frontend**: Deployed on Netlify (spa folder)
- **Backend**: Deployed on Render (backend folder)

## 🔧 Backend Deployment (Render)

Your backend is already configured in `render.yaml`.

### Steps:

1. **Commit and push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy backend to Render"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect and use `render.yaml`

3. **Set Environment Variables** in Render dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)

4. **Note your Render URL** (e.g., `https://translator-backend-xxxx.onrender.com`)

---

## 🌐 Frontend Deployment (Netlify)

Your frontend needs to know the backend URL.

### Steps:

1. **Set up Netlify**:
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - **Base directory**: `spa`
   - **Build command**: `npm run build`
   - **Publish directory**: `spa/dist`

3. **⚠️ CRITICAL: Set Environment Variable**:
   - Go to Site settings → Environment variables
   - Add a new variable:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://your-backend-name.onrender.com/api`
   - Replace `your-backend-name` with your actual Render backend URL

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your frontend

---

## 🔄 Deploying Changes

### The Issue You're Facing:

Your local changes won't appear on the hosted site until you:

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Describe your changes"
   ```

2. **Push to GitHub**:
   ```bash
   git push origin main
   ```

3. **Wait for automatic deployment**:
   - Render will automatically rebuild the backend
   - Netlify will automatically rebuild the frontend

---

## 📋 Current Uncommitted Changes

You have uncommitted changes in:
- `backend/server.js` - Backend API endpoint changes
- `render.yaml` - Render configuration update

These changes need to be committed and pushed!

---

## 🔍 Environment Variables Reference

### Render (Backend):
```
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
NODE_VERSION=18
PORT=auto (Render sets this)
```

### Netlify (Frontend):
```
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Important**: The frontend `.env.example` file shows the format, but you must set this in Netlify's dashboard!

---

## 🐛 Troubleshooting

### Changes not showing up?
1. ✅ Commit and push all changes
2. ✅ Check build logs in Render/Netlify dashboards
3. ✅ Clear browser cache (Ctrl+Shift+R) or use incognito mode

### API connection errors (CORS/Network errors)?
1. ✅ Verify `VITE_API_URL` is set correctly in Netlify
2. ✅ Check Render backend is running (visit the URL directly)
3. ✅ Ensure URL ends with `/api` (e.g., `https://backend.onrender.com/api`)

### Build failures?
1. Check build logs in respective platforms
2. Ensure all dependencies are in package.json
3. Verify environment variables are set

---

## ✅ Deployment Checklist

### First Time Setup:
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Netlify
- [ ] `VITE_API_URL` set in Netlify environment variables
- [ ] API keys set in Render environment variables
- [ ] Test the live application

### For Each Update:
- [ ] Commit changes: `git add . && git commit -m "message"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Wait for auto-deployment (check dashboards)
- [ ] Clear browser cache and test

---

## 🆘 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Netlify Dashboard**: https://app.netlify.com
- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
