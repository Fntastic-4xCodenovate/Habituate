#!/usr/bin/env python3
"""
HABITUATE Backend Startup Script
Handles environment setup and runs the server
"""

import os
import sys
import subprocess
from pathlib import Path

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_path = Path(".env")
    
    if not env_path.exists():
        print("❌ .env file not found!")
        print("📝 Please create a .env file based on .env.example")
        return False
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_KEY", 
        "SECRET_KEY"
    ]
    
    # Load .env and check variables
    from dotenv import load_dotenv
    load_dotenv()
    
    missing = []
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print(f"❌ Missing required environment variables: {', '.join(missing)}")
        print("📝 Please update your .env file")
        return False
    
    print("✅ Environment variables configured")
    return True

def check_dependencies():
    """Check if all dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import supabase
        print("✅ Dependencies installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("📦 Installing dependencies...")
        
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            return False

def run_server():
    """Start the FastAPI server"""
    print("🚀 Starting HABITUATE Backend...")
    print("🌐 Backend will be available at: http://localhost:8000")
    print("📚 API Documentation at: http://localhost:8000/docs")
    print("🔌 Socket.IO endpoint: ws://localhost:8000/socket.io")
    print("\n" + "="*50)
    
    try:
        # Import here to ensure dependencies are loaded
        import uvicorn
        from main import socket_app
        from config import settings
        
        uvicorn.run(
            socket_app,
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down HABITUATE Backend...")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def main():
    """Main startup function"""
    print("🎯 HABITUATE Backend Startup")
    print("="*40)
    
    # Check environment
    if not check_env_file():
        sys.exit(1)
    
    # Check dependencies  
    if not check_dependencies():
        sys.exit(1)
    
    # Run server
    run_server()

if __name__ == "__main__":
    main()