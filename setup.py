#!/usr/bin/env python3
"""
Setup script for User Analytics Application
This script helps automate the setup process
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path

def run_command(command, cwd=None, check=True):
    """Run a shell command and return the result"""
    print(f"Running: {command}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            check=check,
            capture_output=True,
            text=True
        )
        if result.stdout:
            print(result.stdout)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        if e.stdout:
            print(e.stdout)
        if e.stderr:
            print(e.stderr, file=sys.stderr)
        return False

def check_command_exists(command):
    """Check if a command exists in PATH"""
    return shutil.which(command) is not None

def main():
    print("=" * 60)
    print("🚀 User Analytics Application Setup")
    print("=" * 60)
    print()

    # Check Node.js
    if not check_command_exists("node"):
        print("❌ Node.js is not installed!")
        print("   Please install Node.js from: https://nodejs.org/")
        print("   Recommended: Use nvm to manage Node.js versions")
        sys.exit(1)
    
    node_version = subprocess.check_output(["node", "--version"], text=True).strip()
    npm_version = subprocess.check_output(["npm", "--version"], text=True).strip()
    print(f"✅ Node.js version: {node_version}")
    print(f"✅ npm version: {npm_version}")
    print()

    # Check MongoDB (optional)
    if check_command_exists("mongod"):
        print("✅ MongoDB found")
    else:
        print("⚠️  MongoDB not found in PATH")
        print("   Make sure MongoDB is installed and running")
        print("   Install: https://www.mongodb.com/try/download/community")
    print()

    # Project root
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"

    # Install root dependencies
    print("📦 Installing root dependencies...")
    if not run_command("npm install", cwd=project_root):
        print("❌ Failed to install root dependencies")
        sys.exit(1)
    print()

    # Install backend dependencies
    print("📦 Installing backend dependencies...")
    if not run_command("npm install", cwd=backend_dir):
        print("❌ Failed to install backend dependencies")
        sys.exit(1)
    print()

    # Create .env file
    env_example = backend_dir / "env.example"
    env_file = backend_dir / ".env"
    if not env_file.exists():
        print("⚙️  Creating backend/.env file...")
        if env_example.exists():
            shutil.copy(env_example, env_file)
            print("✅ Created backend/.env from env.example")
        else:
            # Create default .env
            with open(env_file, 'w') as f:
                f.write("PORT=3001\n")
                f.write("MONGODB_URI=mongodb://localhost:27017/analytics\n")
                f.write("CORS_ORIGIN=http://localhost:3000\n")
            print("✅ Created backend/.env with default values")
        print("   You can edit backend/.env to change configuration")
    else:
        print("✅ backend/.env already exists")
    print()

    # Install frontend dependencies
    print("📦 Installing frontend dependencies...")
    if not run_command("npm install", cwd=frontend_dir):
        print("❌ Failed to install frontend dependencies")
        sys.exit(1)
    print()

    print("=" * 60)
    print("✨ Setup Complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print()
    print("1. Start MongoDB (if not already running):")
    print("")
    print("   Option A - Docker (Recommended):")
    print("   docker run -d -p 27017:27017 --name mongodb mongo:latest")
    print("")
    print("   Option B - Homebrew (macOS):")
    print("   brew tap mongodb/brew")
    print("   brew install mongodb-community@8.0")
    print("   brew services start mongodb-community@8.0")
    print("")
    print("   Option C - MongoDB Atlas (Cloud):")
    print("   Sign up at https://www.mongodb.com/cloud/atlas")
    print("   Update backend/.env with your Atlas connection string")
    print()
    print("2. Start the backend server (Terminal 1):")
    print("   cd backend && npm run dev")
    print()
    print("3. Start the frontend (Terminal 2):")
    print("   cd frontend && npm run dev")
    print()
    print("4. Test the tracking (optional, Terminal 3):")
    print("   cd demo && python3 -m http.server 8080")
    print("   Then open http://localhost:8080")
    print()
    print("📊 Dashboard will be at: http://localhost:3000")
    print("🔌 Backend API will be at: http://localhost:3001")
    print()

if __name__ == "__main__":
    main()