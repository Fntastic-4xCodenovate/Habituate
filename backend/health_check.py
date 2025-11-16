#!/usr/bin/env python3
"""
HABITUATE Backend Health Check
Verifies backend setup and configuration
"""

import sys
import os
from pathlib import Path

def check_python_version():
    """Check Python version"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 9:
        print(f"   ✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"   ❌ Python {version.major}.{version.minor} (Need 3.9+)")
        return False

def check_env_file():
    """Check if .env file exists"""
    print("\n📝 Checking environment file...")
    env_path = Path(__file__).parent / '.env'
    
    if env_path.exists():
        print("   ✅ .env file found")
        
        # Read and check required variables
        with open(env_path) as f:
            content = f.read()
            
        required_vars = [
            'SUPABASE_URL',
            'SUPABASE_KEY',
            'SECRET_KEY',
            'POSTHOG_API_KEY'
        ]
        
        missing = []
        for var in required_vars:
            if f"{var}=" not in content or f"{var}=your_" in content or f"{var}=xxxxx" in content:
                missing.append(var)
        
        if missing:
            print(f"   ⚠️  Missing or placeholder values: {', '.join(missing)}")
            return False
        else:
            print("   ✅ All required variables configured")
            return True
    else:
        print("   ❌ .env file not found")
        print("   💡 Copy .env.example to .env and configure it")
        return False

def check_dependencies():
    """Check if dependencies are installed"""
    print("\n📦 Checking dependencies...")
    
    try:
        import fastapi
        print(f"   ✅ FastAPI {fastapi.__version__}")
    except ImportError:
        print("   ❌ FastAPI not installed")
        return False
    
    try:
        import socketio
        print(f"   ✅ Socket.IO installed")
    except ImportError:
        print("   ❌ Socket.IO not installed")
        return False
    
    try:
        import supabase
        print(f"   ✅ Supabase client installed")
    except ImportError:
        print("   ❌ Supabase client not installed")
        return False
    
    try:
        import posthog
        print(f"   ✅ PostHog {posthog.VERSION}")
    except ImportError:
        print("   ❌ PostHog not installed")
        return False
    
    return True

def check_project_structure():
    """Check if all required directories exist"""
    print("\n📁 Checking project structure...")
    
    base_path = Path(__file__).parent
    required_dirs = [
        'models',
        'services',
        'routes'
    ]
    
    all_exist = True
    for dir_name in required_dirs:
        dir_path = base_path / dir_name
        if dir_path.exists():
            print(f"   ✅ {dir_name}/ exists")
        else:
            print(f"   ❌ {dir_name}/ missing")
            all_exist = False
    
    return all_exist

def test_imports():
    """Test if main modules can be imported"""
    print("\n🔍 Testing imports...")
    
    try:
        from config import settings
        print("   ✅ config.py imports successfully")
    except Exception as e:
        print(f"   ❌ config.py import failed: {e}")
        return False
    
    try:
        from models.user import UserProfile
        print("   ✅ models.user imports successfully")
    except Exception as e:
        print(f"   ❌ models.user import failed: {e}")
        return False
    
    try:
        from services.database import Database
        print("   ✅ services.database imports successfully")
    except Exception as e:
        print(f"   ❌ services.database import failed: {e}")
        return False
    
    return True

def main():
    """Run all checks"""
    print("=" * 50)
    print("🎯 HABITUATE Backend Health Check")
    print("=" * 50)
    
    checks = [
        check_python_version(),
        check_env_file(),
        check_dependencies(),
        check_project_structure(),
        test_imports()
    ]
    
    print("\n" + "=" * 50)
    
    if all(checks):
        print("✅ All checks passed! Backend is ready.")
        print("\n🚀 Start the backend with:")
        print("   python -m uvicorn main:socket_app --reload")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        print("\n💡 Installation help:")
        print("   pip install -r requirements.txt")
        print("   Copy .env.example to .env and configure it")
        return 1

if __name__ == '__main__':
    sys.exit(main())
