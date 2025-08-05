# Deployment Guide for Netlify

## Option 1: Frontend Only (Static Demo)

This option deploys only the frontend without the backend API. The app will work but won't have real data.

### Steps:
1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Choose your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Click "Deploy site"

## Option 2: Full Stack (Frontend + Backend)

For a full working version, you'll need to deploy the backend separately.

### Backend Deployment Options:

#### A. Netlify Functions (Recommended)
1. Create a `netlify/functions` directory
2. Move your API endpoints to serverless functions
3. Update the frontend to use the new API endpoints

#### B. Railway
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Deploy the backend there
4. Update the frontend API URLs

#### C. Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Point to your repository
4. Set build command: `npm install`
5. Set start command: `node server.js`

### Environment Variables
If deploying backend separately, you'll need to set these environment variables:
- `PORT` (usually set automatically)
- Any database connection strings if you add a database later

## Current Setup Notes

- The app currently uses a local backend server on port 9999
- For production, you'll need to update the API endpoints in the frontend
- The `netlify.toml` file is configured for static site deployment
- The build process will create a `dist` folder with the compiled React app

## Testing the Build Locally

Before deploying, test the build locally:
```bash
npm run build
npm run preview
```

This will build the app and serve it locally to verify everything works. 