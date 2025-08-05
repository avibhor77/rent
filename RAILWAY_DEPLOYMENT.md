# Railway Deployment Guide

Railway offers a free tier that supports both frontend and backend deployment without requiring payment information.

## 🚀 Quick Deploy to Railway

### Step 1: Sign Up
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. No credit card required for free tier

### Step 2: Deploy Backend
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `avibhor77/rent`
4. Railway will auto-detect it's a Node.js project
5. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`

### Step 3: Deploy Frontend
1. In the same project, click "New Service"
2. Select "Static Site"
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`
5. Set environment variable:
   - `REACT_APP_API_URL=https://your-backend-service-url.railway.app`

## 🔧 Manual Setup (Alternative)

If auto-detection doesn't work:

### Backend Service
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Root Directory**: `/` (root)

### Frontend Service
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Root Directory**: `/` (root)

## 🌐 Access Your App

After deployment:
- **Frontend**: `https://your-frontend-service.railway.app`
- **Backend API**: `https://your-backend-service.railway.app`

## 💰 Free Tier Limits

Railway's free tier includes:
- 500 hours/month of runtime
- 1GB RAM per service
- Shared CPU
- Automatic deployments from GitHub

## 🔄 Updates

Any push to your GitHub repository will automatically trigger a new deployment.

## 🆘 Troubleshooting

1. **Build fails**: Check the build logs in Railway dashboard
2. **API not connecting**: Verify `REACT_APP_API_URL` environment variable
3. **Port issues**: Railway automatically assigns ports, no need to configure

## 📞 Support

Railway has excellent documentation and community support at [docs.railway.app](https://docs.railway.app) 