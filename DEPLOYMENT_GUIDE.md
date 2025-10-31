# How to Deploy Your SecureCrypt App on Vercel

## Step 1: Push Code to GitHub

### Option A: Using Git Commands (Recommended)

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it something like `securecrypt-encryption-platform`
   - Make it Public (so you can deploy on Vercel free tier)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code from Replit:**

Open the Replit Shell and run these commands:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit the changes
git commit -m "Initial commit: SecureCrypt encryption platform"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** GitHub may ask for authentication. You can:
- Use a Personal Access Token (recommended)
- Or use the GitHub integration in Replit

### Option B: Download and Upload Manually

1. Download all files from your Replit project
2. Create a new GitHub repo
3. Upload all files to the repository

---

## Step 2: Deploy on Vercel

### Quick Deploy Steps:

1. **Go to Vercel:** https://vercel.com

2. **Sign up/Login** with your GitHub account

3. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel will detect it as a Node.js project

4. **Configure (Important!):**
   - **Framework Preset:** Other (or Node.js)
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

5. **Environment Variables:**
   - You don't need any for this project
   - Just click "Deploy"

6. **Wait for deployment** (takes 1-2 minutes)

7. **Get your URL!** You'll receive something like:
   - `https://securecrypt-encryption-platform.vercel.app`

---

## Important Notes for Vercel

⚠️ **C++ Binary Compilation:**
Vercel's serverless environment may have limitations with C++ binaries. Here are your options:

### Option 1: Pre-compile the binary (Easiest)
Before pushing to GitHub, make sure the C++ binary is compiled:
```bash
cd cpp-backend
g++ -std=c++17 -o web_cryption web_cryption.cpp
cd ..
git add cpp-backend/web_cryption
git commit -m "Add compiled C++ binary"
git push
```

### Option 2: Use a different free host that supports C++
If Vercel doesn't work with the C++ binary, try:
- **Render.com** - Has better support for compiled binaries
- **Railway.app** - Good C++ support
- **Fly.io** - Supports Docker, can run C++ easily

---

## Alternative: Deploy on Render.com (Better C++ Support)

Render might be a better choice for this project:

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name:** securecrypt
   - **Environment:** Node
   - **Build Command:** `npm install && cd cpp-backend && g++ -std=c++17 -o web_cryption web_cryption.cpp`
   - **Start Command:** `npm start`
6. Click "Create Web Service"
7. Get your URL: `https://securecrypt.onrender.com`

---

## After Deployment

Once deployed, you'll have:
- ✅ A permanent public URL
- ✅ HTTPS security automatically
- ✅ Perfect link for your resume
- ✅ Professional portfolio piece

Add this to your resume as:
> **SecureCrypt - File Encryption Platform**  
> Live Demo: [your-vercel-url]  
> GitHub: [your-github-repo]  
> Tech: C++, Node.js, Express, Bootstrap 5

---

## Troubleshooting

**If Vercel deployment fails:**
- Check the build logs
- The C++ binary might not compile on Vercel
- Try Render.com instead (better C++ support)

**If the app doesn't work after deployment:**
- Make sure the C++ binary is executable
- Check that port 5000 is correctly configured
- Verify all dependencies are in package.json

Good luck with your deployment! 🚀
