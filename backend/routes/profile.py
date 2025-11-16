from fastapi import APIRouter, HTTPException
from services.database import Database
from models.user import UserProfile, UserStats

router = APIRouter()
db = Database()

@router.get("/{user_id}", response_model=UserProfile)
async def get_profile(user_id: str):
    """Get user profile"""
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}/stats", response_model=UserStats)
async def get_user_stats(user_id: str):
    """Get comprehensive user statistics"""
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    habits = await db.get_user_habits(user_id)
    badges = await db.get_user_badges(user_id)
    
    # Calculate stats
    total_completions = sum(h.get('total_completions', 0) for h in habits)
    current_streak = max((h.get('streak', 0) for h in habits), default=0)
    longest_streak = max((h.get('best_streak', 0) for h in habits), default=0)
    
    clan_contribution = 0
    if user.get('clan_id'):
        clan_contribution = await db.get_clan_member_contribution(
            user['clan_id'], user_id
        )
    
    return {
        'total_habits': len(habits),
        'total_completions': total_completions,
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'total_xp': user.get('xp', 0),
        'level': user.get('level', 1),
        'badges_earned': len(badges),
        'clan_xp_contribution': clan_contribution
    }

@router.put("/{user_id}")
async def update_profile(user_id: str, updates: dict):
    """Update user profile"""
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated = await db.update_user(user_id, updates)
    return updated
