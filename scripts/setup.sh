#!/bin/bash

# User Analytics Application Setup Script
# This script helps set up the development environment

set -e  # Exit on error

echo "🚀 Setting up User Analytics Application..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if MongoDB is running (optional check)
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB found"
else
    echo "⚠️  MongoDB not found in PATH. Make sure MongoDB is installed and running."
    echo "   Install: https://www.mongodb.com/try/download/community"
fi
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating backend/.env file..."
    cp env.example .env
    echo "✅ Created backend/.env (using default values)"
    echo "   You can edit backend/.env to change configuration"
else
    echo "✅ backend/.env already exists"
fi
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB (if not already running):"
echo "   - macOS: brew services start mongodb-community"
echo "   - Linux: sudo systemctl start mongod"
echo "   - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
echo ""
echo "2. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend (in a new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Test the tracking (optional):"
echo "   cd demo && python3 -m http.server 8080"
echo "   Then open http://localhost:8080"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 Backend API: http://localhost:3001"