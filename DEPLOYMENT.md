# Deployment Guide

This guide covers deploying the User Analytics Application to free hosting platforms.

## Monorepo Structure

**Yes, you can push both backend and frontend to one repository!** This project is already set up as a monorepo (single repository with both backend and frontend). Both services will be deployed from the same GitHub repository but to different hosting platforms.

**Repository Structure:**
```
your-repo/
├── backend/          # Node.js/Express backend
├── frontend/         # Next.js frontend
├── tracking-script/  # Analytics tracking script
└── ...
```

**Deployment:**
- **Backend** → Deploy from `backend/` directory to Render/Railway
- **Frontend** → Deploy from `frontend/` directory to Vercel
- **Same GitHub repo** → Both services connect to the same repository

## Free Hosting Options

### Recommended Setup:
- **Frontend (Next.js)**: Vercel (free tier, perfect for Next.js)
- **Backend (Node.js)**: Render or Railway (free tier)
- **Database (MongoDB)**: MongoDB Atlas (free tier - 512MB)

## Quick Deploy (5 Minutes)

1. **MongoDB Atlas** (2 min): Create free cluster, get connection string (see Step 1 below)
2. **Backend to Render** (2 min): Deploy `backend/` folder, set Root Directory to `backend`
3. **Frontend to Vercel** (1 min): Deploy `frontend/` folder, set Root Directory to `frontend`
4. **Update CORS** (30 sec): Set backend CORS_ORIGIN to your Vercel URL

See detailed steps below.

## Step 1: Set Up MongoDB Atlas (Free)

1. **Sign up**: Go to https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**:
   - Choose FREE (M0) tier
   - Select your preferred region
   - Create cluster (takes 3-5 minutes)
3. **Configure Access**:
   - Click "Database Access" → "Add New Database User"
   - Create username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
4. **Network Access**:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add specific IPs for production
5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Select "Drivers" (for Node.js application)
   - Choose "Node.js" as the driver and version (3.6 or later)
   - Copy the connection string that appears
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `analytics` (or your preferred database name)
   - Example: `mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/analytics?retryWrites=true&w=majority`

## Step 2: Deploy Backend to Render

### Option A: Render (Recommended)

1. **Sign up**: https://render.com (free tier available)
2. **Create New Web Service**:
   - Connect your GitHub repository (the same repo with both backend and frontend)
   - Select the repository
   - Configure:
     - **Name**: `analytics-backend` (or your choice)
     - **Environment**: `Node` ⚠️ **Select "Node" from the dropdown**
     - **Root Directory**: `backend` ⚠️ **Important: Set this to `backend`**
     - **Build Command**: `npm install` (runs in backend directory)
     - **Start Command**: `npm start` (runs in backend directory)
3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=your_mongodb_atlas_connection_string
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
4. **Deploy**: Click "Create Web Service"
5. **Note the URL**: You'll get something like `https://analytics-backend.onrender.com`

### Option B: Railway

1. **Sign up**: https://railway.app (free tier with $5 credit)
2. **New Project** → "Deploy from GitHub repo"
3. **Configure**:
   - Select your repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables**: Same as Render
5. **Deploy**: Railway auto-detects and deploys

## Step 3: Deploy Frontend to Vercel

1. **Sign up**: https://vercel.com (free tier, perfect for Next.js)
2. **Import Project**:
   - Connect your GitHub repository (the same repo with both backend and frontend)
   - Select the repository
3. **Configure**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **Important: Set this to `frontend`**
   - **Build Command**: `npm run build` (default, runs in frontend directory)
   - **Output Directory**: `.next` (default)
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
5. **Deploy**: Click "Deploy"
6. **Note the URL**: You'll get something like `https://analytics-dashboard.vercel.app`

## Step 4: Update Environment Variables

After deployment, update environment variables:

### Backend (Render/Railway):
```
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel):
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

Redeploy both services after updating environment variables.

## Step 5: Verify Deployment

1. **Check Backend**: Visit `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok","message":"Analytics API is running"}`
   - If it fails, check Render logs for MongoDB connection errors

2. **Check Frontend**: Visit `https://your-frontend.vercel.app`
   - Dashboard should load
   - Navigate to Demo page
   - Interact with elements
   - Check Sessions page for events

## Troubleshooting Deployment Issues

### Backend Exits with Status 1

If your backend crashes on Render, check:

1. **MongoDB Connection**:
   - Verify `MONGODB_URI` is set in Render environment variables
   - Check MongoDB Atlas Network Access allows `0.0.0.0/0` (all IPs)
   - Verify connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/analytics?retryWrites=true&w=majority`
   - Make sure you replaced `<password>` with actual password

2. **Check Render Logs**:
   - Go to Render dashboard → Your service → Logs
   - Look for MongoDB connection errors
   - Common errors:
     - "MONGODB_URI environment variable is not set"
     - "MongoServerError: Authentication failed"
     - "MongoServerSelectionError: connection timeout"

3. **Environment Variables**:
   - Double-check all environment variables are set correctly
   - No extra spaces or quotes in values
   - Connection string should be on one line

## Alternative Free Hosting Options

### Backend Alternatives:
- **Fly.io**: Free tier with 3 shared VMs
- **Heroku**: Free tier discontinued, but paid plans available
- **Cyclic**: Free tier for serverless Node.js

### Frontend Alternatives:
- **Netlify**: Free tier, good for static sites
- **Cloudflare Pages**: Free tier, fast CDN

## Environment Variables Reference

### Backend (.env):
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/analytics
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (.env.local or Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Production Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed and health check works
- [ ] Frontend deployed and loads correctly
- [ ] Environment variables set correctly
- [ ] CORS configured with production frontend URL
- [ ] Tracking script loads on demo page
- [ ] Events are being stored in database
- [ ] Dashboard displays sessions correctly

## Troubleshooting Deployment

### Backend Issues:
- **Build fails**: Check Node.js version (should be 16+)
- **Database connection fails**: Verify MongoDB Atlas IP whitelist
- **CORS errors**: Check CORS_ORIGIN environment variable

### Frontend Issues:
- **API calls fail**: Verify NEXT_PUBLIC_API_URL is set correctly
- **Build fails**: Check Next.js version compatibility
- **Tracking script not loading**: Verify /analytics.js is accessible

### Common Issues:
1. **Environment variables not updating**: Redeploy after changes
2. **Cold starts**: Render free tier has cold starts (first request may be slow)
3. **MongoDB connection timeout**: Check network access settings in Atlas

## Cost Estimate

**Free Tier Limits:**
- **Vercel**: Unlimited deployments, 100GB bandwidth/month
- **Render**: 750 hours/month (enough for 24/7), 512MB RAM
- **MongoDB Atlas**: 512MB storage, shared cluster
- **Total Cost**: $0/month (within free tier limits)

## Monitoring

### Free Monitoring Options:
- **Vercel Analytics**: Built-in for Next.js apps
- **Render Metrics**: Built-in dashboard
- **MongoDB Atlas Monitoring**: Built-in cluster monitoring

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **MongoDB Credentials**: Use strong passwords
3. **CORS**: Restrict to your frontend domain only
4. **Rate Limiting**: Consider adding for production (not implemented in free tier)
5. **HTTPS**: All platforms provide HTTPS by default

## Backup Strategy

1. **Database**: MongoDB Atlas provides automatic backups (paid tier)
2. **Code**: GitHub repository serves as backup
3. **Environment Variables**: Document in secure location

## Scaling Considerations

If you exceed free tier limits:
- **Render**: $7/month for always-on service
- **Vercel**: Pro plan $20/month for more features
- **MongoDB Atlas**: M10 cluster $57/month for better performance

For most use cases, free tier is sufficient for development and small-scale production.