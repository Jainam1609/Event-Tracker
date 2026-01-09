# Setup Guide

## Quick Start

### Step 1: Make Sure MongoDB is Running

```bash
docker ps | grep mongodb
```

If not running:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

You should see: `Server running on port 3001`

### Step 3: Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

You should see: `Ready on http://localhost:3000`

### Step 4: Test It!

1. Open dashboard: http://localhost:3000
2. Click "Demo" in the navigation (or go to http://localhost:3000/demo)
3. Open Developer Tools (F12) → Console tab (if debug mode enabled)
4. Interact with elements on the demo page:
   - Click buttons
   - Fill out the form
   - Click on images
   - Scroll the page
5. Navigate back to "Sessions" page
6. Click "Refresh" button
7. You should see your session with all tracked events!

## Automated Setup

Choose one of these methods:

```bash
# Option 1: Python setup script (recommended)
python3 setup.py

# Option 2: Bash setup script
./scripts/setup.sh

# Option 3: npm script
npm run install:all
```

All scripts will:
- ✅ Check for Node.js installation
- ✅ Install all dependencies (root, backend, frontend)
- ✅ Create backend/.env file from template
- ✅ Verify MongoDB setup

## Manual Setup

### 1. Install Dependencies

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 2. Configure Backend

Create `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit `.env` if needed (defaults should work for local development).

## 3. Start MongoDB

Make sure MongoDB is running. Choose one option:

### Option A: Docker (Recommended - Easiest)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option B: Homebrew (macOS)

```bash
# First add MongoDB tap (if not already done)
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community@8.0

# Start MongoDB service
brew services start mongodb-community@8.0
```

### Option C: MongoDB Atlas (Cloud - Free)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Update `backend/.env` with your Atlas connection string

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions.

## 4. Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:3001

## 5. Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Dashboard runs on: http://localhost:3000

## 6. Test Tracking

The demo page is integrated into the dashboard. Simply navigate to:

```
http://localhost:3000/demo
```

Or click the "Demo" link in the dashboard navigation. No separate server needed!

## Verify Everything Works

1. Open http://localhost:3000 - Dashboard should load
2. Click "Demo" in navigation - Demo page should load at http://localhost:3000/demo
3. Interact with elements on demo page (buttons, forms, images, etc.)
4. Navigate back to "Sessions" page
5. Click "Refresh" - you should see your session with all tracked events

## Troubleshooting

- **Backend won't start**: Check MongoDB is running and port 3001 is free
- **No events showing**: Check browser console for errors, verify backend is running
- **CORS errors**: Update CORS_ORIGIN in backend/.env file