# Railway Backend Deployment Guide

Deploy your Node.js backend server to Railway for free!

## 🚀 Quick Deploy Steps

### Step 1: Create Backend Repository
1. Create a new GitHub repository for your backend (e.g., `rent-backend`)
2. Copy these files to the new repository:
   - `server.js`
   - `package.json`
   - `data/` folder (all CSV files)
   - `railway-backend.json`

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your backend repository
6. Railway will auto-detect it's a Node.js project

### Step 3: Set Environment Variables
In Railway dashboard, add these environment variables:
- `NODE_ENV=production`
- `PORT=10000`

### Step 4: Get Your Backend URL
After deployment, Railway will give you a URL like:
`https://your-backend-name.railway.app`

## 🔧 Manual Setup (Alternative)

If you want to deploy from your current repository:

### Step 1: Create Backend Branch
```bash
git checkout -b backend-only
git rm -r src/ public/ index.html vite.config.js vercel.json
git commit -m "Backend only version"
git push origin backend-only
```

### Step 2: Deploy Backend Branch
1. In Railway, select your repository
2. Choose the `backend-only` branch
3. Deploy

## 🌐 Connect Frontend to Backend

Once your backend is deployed, update your frontend:

### Option A: Environment Variable
Add to your Vercel environment variables:
- `REACT_APP_API_URL=https://your-backend-name.railway.app`

### Option B: Update API Calls
In `src/app.jsx`, change all API calls from:
```javascript
fetch('/api/dashboard-data')
```
to:
```javascript
fetch('https://your-backend-name.railway.app/api/dashboard-data')
```

## 📁 Required Files for Backend

Your backend repository should contain:
```
rent-backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── railway-backend.json   # Railway config
└── data/                  # CSV data files
    ├── manual_rent_data.csv
    ├── tenant_configs.csv
    ├── a88_meter_data.csv
    └── a206_meter_data.csv
```

## 💰 Free Tier Features

Railway's free tier includes:
- 500 hours/month runtime
- 1GB RAM
- Automatic deployments
- Custom domains

## 🔄 Updates

Any push to your backend repository will automatically redeploy.

## 🆘 Troubleshooting

1. **Build fails**: Check Railway build logs
2. **Port issues**: Railway auto-assigns ports
3. **CSV not found**: Ensure data folder is included
4. **CORS errors**: Backend has CORS enabled

## 📞 Support

Railway has excellent documentation at [docs.railway.app](https://docs.railway.app) 