# Render Deployment Guide

## Quick Deploy to Render

### Option 1: Blueprint Deployment (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/Login with your GitHub account

3. **Create Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy both services

4. **Wait for Deployment**
   - Backend will deploy first (takes 2-3 minutes)
   - Frontend will deploy after backend is ready
   - Both services will be available at the provided URLs

### Option 2: Manual Deployment

#### Deploy Backend First

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `node server.js`
   - Add environment variable: `PORT = 10000`

2. **Deploy Backend**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://rent-app-backend.onrender.com`)

#### Deploy Frontend

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Set build command: `npm install && npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL = https://rent-app-backend.onrender.com`

2. **Deploy Frontend**
   - Click "Create Static Site"
   - Wait for deployment to complete

## Environment Variables

### Backend (Web Service)
- `PORT`: 10000
- `NODE_ENV`: production

### Frontend (Static Site)
- `VITE_API_URL`: Your backend service URL

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible

2. **API Connection Issues**
   - Verify `VITE_API_URL` is set correctly
   - Check that backend is running and accessible

3. **Port Issues**
   - Render automatically assigns ports, so `PORT` environment variable is used

### Support

- Render provides free tier with some limitations
- Check Render documentation for more details
- Monitor deployment logs for specific errors

## Benefits of Render

- ✅ **Free Tier Available**: No credit card required for basic deployment
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Easy Scaling**: Upgrade when needed
- ✅ **Git Integration**: Automatic deployments from GitHub
- ✅ **Custom Domains**: Add your own domain name 