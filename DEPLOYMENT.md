# Deployment Guide

This application is deployed and live:

- **Frontend**: https://event-tracker-liart-psi.vercel.app
- **Backend API**: https://event-tracker-dftf.onrender.com
- **Health Check**: https://event-tracker-dftf.onrender.com/health

## Monorepo Structure

This project is a **monorepo** - both backend and frontend are in the same repository. Both services are deployed from the same GitHub repository to different hosting platforms.

**Repository Structure:**
```
your-repo/
├── backend/          # Node.js/Express backend → Deployed to Render
├── frontend/         # Next.js frontend → Deployed to Vercel
├── tracking-script/  # Analytics tracking script
└── ...
```

## Deployment Overview

### Current Deployment

- **Frontend (Next.js)**: Vercel - https://event-tracker-liart-psi.vercel.app
- **Backend (Node.js)**: Render - https://event-tracker-dftf.onrender.com
- **Database (MongoDB)**: MongoDB Atlas (free tier - 512MB)

## Step 1: Set Up MongoDB Atlas

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
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
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Select "Drivers" → Choose "Node.js"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `analytics`
   - **Important**: If password has special characters (like `@`), URL-encode them:
     - `@` → `%40`, `#` → `%23`, `/` → `%2F`, etc.
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/analytics?retryWrites=true&w=majority`

## Step 2: Deploy Backend to Render

1. **Sign up**: https://render.com
2. **Create New Web Service**:
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Name**: `event-tracker-backend` (or your choice)
     - **Environment**: `Node`
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/analytics?retryWrites=true&w=majority
   CORS_ORIGIN=https://event-tracker-liart-psi.vercel.app
   ```
   **Important**: 
   - Replace `username` and `password` with your MongoDB credentials
   - URL-encode special characters in password
   - Set `CORS_ORIGIN` to your frontend URL (no trailing slash)
4. **Deploy**: Click "Create Web Service"
5. **Note the URL**: You'll get something like `https://event-tracker-dftf.onrender.com`

## Step 3: Deploy Frontend to Vercel

1. **Sign up**: https://vercel.com
2. **Import Project**:
   - Connect your GitHub repository
   - Select the repository
3. **Configure**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://event-tracker-dftf.onrender.com
   ```
   **Important**: Replace with your actual Render backend URL
5. **Deploy**: Click "Deploy"
6. **Note the URL**: You'll get something like `https://event-tracker-liart-psi.vercel.app`

## Step 4: Update Environment Variables

After both services are deployed, verify environment variables:

### Backend (Render):
- `CORS_ORIGIN` should be: `https://event-tracker-liart-psi.vercel.app` (no trailing slash)

### Frontend (Vercel):
- `NEXT_PUBLIC_API_URL` should be: `https://event-tracker-dftf.onrender.com`

**Important**: After updating environment variables, redeploy both services.

## Step 5: Verify Deployment

1. **Backend Health Check**: 
   - Visit: https://event-tracker-dftf.onrender.com/health
   - Should return: `{"status":"ok","message":"Analytics API is running"}`

2. **Frontend Dashboard**: 
   - Visit: https://event-tracker-liart-psi.vercel.app
   - Dashboard should load
   - Navigate to Demo page
   - Interact with elements
   - Check Sessions page for events

## Troubleshooting

### Backend Issues

**Backend crashes on startup:**
- Check `MONGODB_URI` is set correctly in Render environment variables
- Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
- Check connection string format (must use hostname, not IP)
- URL-encode special characters in password
- Check Render logs for specific error messages

**CORS errors:**
- Verify `CORS_ORIGIN` matches your frontend URL exactly (no trailing slash)
- Check browser console for blocked origin
- Ensure backend is redeployed after changing CORS_ORIGIN

**MongoDB connection fails:**
- Verify connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/analytics?retryWrites=true&w=majority`
- Check MongoDB Atlas Network Access settings
- Verify database user credentials are correct

### Frontend Issues

**"Failed to load sessions":**
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
- **Redeploy frontend** (environment variables require rebuild)
- Check browser console for API errors
- Verify backend is running and accessible

**API calls fail:**
- Check `NEXT_PUBLIC_API_URL` points to correct backend URL
- Verify backend CORS_ORIGIN includes frontend URL
- Check browser network tab for failed requests

### Common Issues

1. **Environment variables not updating**: Redeploy after changes
2. **Cold starts**: Render free tier has cold starts (first request may be slow)
3. **Connection timeout**: Check MongoDB Atlas network access settings

## Environment Variables Reference

### Backend (Render):
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/analytics?retryWrites=true&w=majority
CORS_ORIGIN=https://event-tracker-liart-psi.vercel.app
```

### Frontend (Vercel):
```env
NEXT_PUBLIC_API_URL=https://event-tracker-dftf.onrender.com
```

## Production Checklist

- [x] MongoDB Atlas cluster created
- [x] Backend deployed to Render
- [x] Frontend deployed to Vercel
- [x] Environment variables configured
- [x] CORS configured correctly
- [x] Health check endpoint working
- [x] Frontend can connect to backend
- [x] Events are being tracked and stored

## Cost

**Free Tier (Current Setup):**
- **Vercel**: Unlimited deployments, 100GB bandwidth/month
- **Render**: 750 hours/month (enough for 24/7), 512MB RAM
- **MongoDB Atlas**: 512MB storage, shared cluster
- **Total Cost**: $0/month

## Security

1. **Environment Variables**: Never commit `.env` files
2. **MongoDB Credentials**: Use strong passwords
3. **CORS**: Restricted to frontend domain only
4. **HTTPS**: All platforms provide HTTPS by default

## Monitoring

- **Vercel Analytics**: Built-in for Next.js apps
- **Render Metrics**: Built-in dashboard
- **MongoDB Atlas Monitoring**: Built-in cluster monitoring

For detailed setup instructions, see [SETUP.md](./SETUP.md).