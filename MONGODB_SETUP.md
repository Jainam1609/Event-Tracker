# MongoDB Setup Guide

## Quick Start - Docker (Recommended)

The easiest way to get MongoDB running is using Docker:

```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps

# Check logs
docker logs mongodb

# Stop MongoDB
docker stop mongodb

# Start MongoDB again
docker start mongodb

# Remove container (if needed)
docker rm mongodb
```

That's it! MongoDB will be available at `mongodb://localhost:27017`

## Homebrew Installation (macOS)

If you prefer to install MongoDB directly on macOS:

### Prerequisites

Make sure you have Xcode Command Line Tools installed and updated:

```bash
# Update Command Line Tools
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install

# Or update via System Settings > Software Update
```

### Installation Steps

```bash
# 1. Add MongoDB tap
brew tap mongodb/brew

# 2. Install MongoDB Community Edition
brew install mongodb-community@8.0

# 3. Start MongoDB service
brew services start mongodb-community@8.0

# 4. Verify it's running
brew services list | grep mongodb

# To stop MongoDB
brew services stop mongodb-community@8.0
```

### Troubleshooting Homebrew Installation

If you encounter errors:

1. **Command Line Tools Error**: Update Xcode Command Line Tools (see above)

2. **Permission Errors**: 
   ```bash
   sudo chown -R $(whoami) /opt/homebrew
   ```

3. **Port Already in Use**: 
   ```bash
   # Check what's using port 27017
   lsof -i :27017
   # Kill the process if needed
   ```

## MongoDB Atlas (Cloud - Free Tier)

Perfect for development and avoids local installation:

1. **Sign up**: Go to https://www.mongodb.com/cloud/atlas/register

2. **Create a cluster**: 
   - Choose FREE tier (M0)
   - Select your preferred region
   - Create cluster

3. **Configure Access**:
   - Click "Database Access" → "Add New Database User"
   - Create username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add specific IPs for production

4. **Get Connection String**:
   - Click "Connect" on your cluster
   - You'll see a modal with options: **Drivers**, Compass, Shell, etc.
   - Click on **"Drivers"** (this is for connecting from your Node.js application)
   - Choose "Node.js" as the driver and version (3.6 or later)
   - Copy the connection string that appears
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `analytics` (or your preferred database name)
   - Update `backend/.env`:
     ```
     MONGODB_URI=mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/analytics?retryWrites=true&w=majority
     ```
   
   **Important**: When you click "Connect", you'll see multiple options. Make sure to click **"Drivers"** (not Compass or Shell) to get the connection string for your Node.js backend.

5. **Benefits**:
   - No local installation needed
   - Works from anywhere
   - Free tier is sufficient for development
   - Automatic backups

## Verify MongoDB is Running

Test the connection:

```bash
# If using local MongoDB
mongosh mongodb://localhost:27017/analytics

# Or use the MongoDB shell (if installed)
mongosh

# Run a test command
db.runCommand({ ping: 1 })
# Should return: { ok: 1 }
```

Or test from the backend:

```bash
cd backend
node -e "require('mongoose').connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/analytics').then(() => { console.log('Connected!'); process.exit(0); })"
```

## Recommended Setup for This Project

For the fastest setup, we recommend **Docker**:

```bash
docker run -d \
  -p 27017:27017 \
  --name mongodb \
  -v mongodb_data:/data/db \
  mongo:latest
```

This will:
- Start MongoDB on port 27017
- Persist data in a Docker volume
- Run in the background
- Automatically restart if your computer reboots (if Docker is set to auto-start)

Then update `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/analytics
```

And you're ready to go!