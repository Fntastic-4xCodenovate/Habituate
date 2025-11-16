from fastapi import APIRouter, HTTPException
from services.database import Database

router = APIRouter()
db = Database()

@router.post("/register")
async def register_user(clerk_user_id: str, username: str, email: str):
    """Register a new user from Clerk"""
    # Check if user already exists
    existing_user = await db.get_user(clerk_user_id)
    if existing_user:
        return {'message': 'User already exists', 'user': existing_user}
    
    # Create new user profile
    user_data = {
        'clerk_user_id': clerk_user_id,
        'username': username,
        'email': email,
        'total_points': 0,
        'level': 1,
        'xp': 0,
        'extra_lives': 0
    }
    
    new_user = await db.create_user(user_data)
    
    return {
        'message': 'User registered successfully',
        'user': new_user
    }

@router.get("/me/{clerk_user_id}")
async def get_current_user(clerk_user_id: str):
    """Get current user from Clerk ID"""
    user = await db.get_user(clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
