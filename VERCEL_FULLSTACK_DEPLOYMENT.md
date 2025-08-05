# Vercel Full-Stack Deployment Guide

Deploy both your frontend and backend on Vercel using serverless functions!

## 🚀 What We've Set Up

Your project now has:
- **Frontend**: React app with Material-UI
- **Backend**: Express.js server as Vercel serverless functions
- **Data**: CSV files for rent, meter, and tenant data
- **API Routes**: All endpoints in `/api/index.js`

## 📁 Project Structure

```
Rent/
├── src/                    # React frontend
│   ├── app.jsx
│   └── main.jsx
├── api/                    # Vercel serverless functions
│   └── index.js           # Backend API
├── data/                   # CSV data files
│   ├── manual_rent_data.csv
│   ├── tenant_configs.csv
│   ├── a88_meter_data.csv
│   └── a206_meter_data.csv
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
└── README.md
```

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Vercel serverless functions for full-stack deployment"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository: `avibhor77/rent`
5. Vercel will auto-detect the configuration
6. Click "Deploy"

## 🌐 Your App Will Be Available At

- **Main URL**: `https://your-app-name.vercel.app`
- **API Endpoints**: `https://your-app-name.vercel.app/api/*`

## 📊 API Endpoints Available

- `GET /api/test` - Health check
- `GET /api/dashboard-data?month=August%2025` - Dashboard data
- `GET /api/rent-data` - All rent data
- `GET /api/meter-data` - Meter readings
- `GET /api/tenant-configs` - Tenant configurations
- `POST /api/mark-payment-paid` - Mark payment as paid

## 💰 Vercel Free Tier Features

- **Unlimited deployments**
- **100GB bandwidth/month**
- **100GB storage**
- **Serverless functions** (up to 10 seconds execution)
- **Automatic HTTPS**
- **Global CDN**

## 🔄 Automatic Updates

Any push to your GitHub repository automatically triggers a new deployment.

## 🆘 Troubleshooting

### Common Issues:

1. **Function timeout**: Serverless functions have a 10-second limit
   - Solution: Optimize data loading (already done with caching)

2. **CSV file not found**: 
   - Solution: Ensure data folder is in the repository

3. **CORS errors**:
   - Solution: CORS is already configured in the API

4. **Memory issues**:
   - Solution: Data is loaded once and cached

### Debug Steps:

1. **Check Vercel logs** in the dashboard
2. **Test API endpoints** directly
3. **Verify CSV files** are present
4. **Check function logs** for errors

## 📈 Performance Optimizations

- **Data caching**: CSV data is loaded once and cached
- **Efficient queries**: Only load required data
- **Compressed responses**: JSON responses are optimized
- **CDN delivery**: Static assets served globally

## 🔧 Local Development

To test locally:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy locally
vercel dev
```

## 🎯 Next Steps

After deployment:
1. **Test all features** - Dashboard, tenant config, reports
2. **Verify data** - Check that CSV data is loading correctly
3. **Monitor performance** - Check Vercel analytics
4. **Set up custom domain** (optional)

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Serverless Functions**: [vercel.com/docs/functions](https://vercel.com/docs/functions)
- **Deployment Issues**: Check Vercel dashboard logs

Your rent management system will be fully functional with both frontend and backend on Vercel! 🎉 