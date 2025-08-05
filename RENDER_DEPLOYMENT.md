# Deploy to Render (Free Full-Stack)

## 🚀 Quick Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Deploy on Render

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Blueprint"**
4. **Connect your GitHub repository**
5. **Render will auto-detect** the `render.yaml` configuration
6. **Click "Apply"**

### 3. What Render Will Create

- **Backend Service**: `rent-app-backend.onrender.com`
- **Frontend Service**: `rent-app-frontend.onrender.com`

## 🔧 Manual Setup (Alternative)

If Blueprint doesn't work, create services manually:

### Backend Service
1. **New +** → **"Web Service"**
2. **Connect GitHub repo**
3. **Settings**:
   - **Name**: `rent-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Port**: `10000`

### Frontend Service
1. **New +** → **"Static Site"**
2. **Connect GitHub repo**
3. **Settings**:
   - **Name**: `rent-app-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

## 🌍 Environment Variables

### Backend Environment Variables
- `NODE_ENV`: `production`
- `PORT`: `10000`

### Frontend Environment Variables
- `REACT_APP_API_URL`: `https://rent-app-backend.onrender.com`

## 📁 Required Files

Make sure these files are in your repository:
- ✅ `render.yaml` - Render configuration
- ✅ `package.json` - Dependencies
- ✅ `server.js` - Backend server
- ✅ `src/` - Frontend React code
- ✅ `data/` - CSV data files

## 🎯 Benefits of Render

- **Free tier**: 750 hours/month for web services
- **Auto-deploy**: From GitHub pushes
- **Custom domains**: Available
- **SSL certificates**: Automatic
- **Database**: PostgreSQL available
- **Logs**: Real-time monitoring

## 🔍 Troubleshooting

### Backend Issues
- Check logs in Render dashboard
- Verify `PORT` environment variable
- Ensure all dependencies in `package.json`

### Frontend Issues
- Check build logs
- Verify `REACT_APP_API_URL` points to backend
- Ensure `dist/` folder is generated

### Data Issues
- CSV files must be in `data/` folder
- Check file permissions
- Verify file paths in `server.js`

## 🚀 After Deployment

1. **Test your app**: Visit the frontend URL
2. **Check API**: Test backend endpoints
3. **Monitor logs**: Use Render dashboard
4. **Custom domain**: Add in Render settings

Your app will be live at:
- **Frontend**: `https://rent-app-frontend.onrender.com`
- **Backend**: `https://rent-app-backend.onrender.com` 