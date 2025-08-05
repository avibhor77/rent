# Railway Deployment Guide

## Free Deployment on Railway (No Payment Required)

Railway offers a free tier that doesn't require payment information upfront.

### Step 1: Deploy Backend

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub (no payment info needed)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository: `https://github.com/avibhor77/rent`

3. **Configure Backend Service**
   - Railway will auto-detect it's a Node.js app
   - Set environment variables:
     - `PORT`: `10000`
     - `NODE_ENV`: `production`

4. **Deploy Backend**
   - Click "Deploy Now"
   - Wait for deployment (2-3 minutes)
   - Note the service URL (e.g., `https://rent-app-backend-production.up.railway.app`)

### Step 2: Deploy Frontend

1. **Create Static Site**
   - In the same Railway project, click "New Service"
   - Select "Static Site"

2. **Configure Frontend**
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL` = your backend URL

3. **Deploy Frontend**
   - Click "Deploy Now"
   - Wait for deployment

### Alternative: Netlify (Frontend Only)

If you want to try a different approach:

1. **Deploy Frontend to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variable: `VITE_API_URL` = your Railway backend URL

2. **Benefits**
   - Netlify free tier is very generous
   - No payment information required
   - Automatic HTTPS and CDN

### Environment Variables

#### Backend (Railway)
```
PORT=10000
NODE_ENV=production
```

#### Frontend (Railway or Netlify)
```
VITE_API_URL=https://your-backend-url.railway.app
```

### Troubleshooting

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible

2. **API Connection Issues**
   - Verify `VITE_API_URL` is set correctly
   - Check that backend is running and accessible

3. **Free Tier Limits**
   - Railway: 500 hours/month free
   - Netlify: 100GB bandwidth/month free

### Benefits of This Approach

- ✅ **No Payment Required**: Free tier available without credit card
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Easy Scaling**: Upgrade when needed
- ✅ **Git Integration**: Automatic deployments from GitHub
- ✅ **Custom Domains**: Add your own domain name

### Railway vs Netlify

| Feature | Railway | Netlify |
|---------|---------|---------|
| Free Tier | 500 hours/month | 100GB bandwidth/month |
| Backend Support | ✅ Full Node.js | ❌ Functions only |
| Frontend Support | ✅ Static sites | ✅ Excellent |
| Payment Required | ❌ No | ❌ No |
| Setup Complexity | Medium | Easy |

**Recommendation**: Use Railway for both services, or Railway for backend + Netlify for frontend. 