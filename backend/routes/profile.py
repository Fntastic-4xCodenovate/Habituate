from fastapi import APIRouter, HTTPException
from services.database import Database
from models.user import UserProfile, UserStats
from services.leveling import level_from_xp, progress_from_xp

router = APIRouter()
db = Database()

@router.get("/{clerk_user_id}")
async def get_profile(clerk_user_id: str):
    """Get user profile"""
    user = await db.get_user(clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Ensure level matches current XP
    current_xp = user.get('xp', 0)
    computed_level = level_from_xp(current_xp)
    if user.get('level') != computed_level:
        try:
            await db.update_user(clerk_user_id, {'level': computed_level})
            user['level'] = computed_level
        except Exception:
            # If DB update fails, still return computed level for display
            user['level'] = computed_level
    return user

@router.get("/{clerk_user_id}/stats")
async def get_user_stats(clerk_user_id: str):
    """Get comprehensive user statistics"""
    user = await db.get_user(clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get internal user ID for other operations
    internal_user_id = user['id']
    
    habits = await db.get_user_habits(internal_user_id)
    badges = await db.get_user_badges(internal_user_id) if hasattr(db, 'get_user_badges') else []
    
    # Calculate stats
    total_completions = sum(h.get('total_completions', 0) for h in habits)
    current_streak = max((h.get('streak', 0) for h in habits), default=0)
    longest_streak = max((h.get('best_streak', 0) for h in habits), default=0)
    
    clan_contribution = 0
    if user.get('clan_id'):
        clan_contribution = await db.get_clan_member_contribution(
            user['clan_id'], internal_user_id
        ) if hasattr(db, 'get_clan_member_contribution') else 0
    
    # Ensure level matches current XP for stats
    computed_level = level_from_xp(user.get('xp', 0))
    if user.get('level') != computed_level:
        try:
            await db.update_user(clerk_user_id, {'level': computed_level})
        except Exception:
            pass

    return {
        'total_habits': len(habits),
        'total_completions': total_completions,
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'total_xp': user.get('xp', 0),
        'level': computed_level,
        'badges_earned': len(badges),
        'clan_xp_contribution': clan_contribution
    }

@router.get("/{clerk_user_id}/level-progress")
async def get_level_progress(clerk_user_id: str):
    """Get user's current level and progress to next level"""
    user = await db.get_user(clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_xp = user.get('xp', 0)
    progress_info = progress_from_xp(current_xp)
    
    return progress_info

@router.put("/{clerk_user_id}")
async def update_profile(clerk_user_id: str, updates: dict):
    """Update user profile"""
    user = await db.get_user(clerk_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # If XP is being updated, sync level accordingly unless explicitly provided
    if 'xp' in updates and 'level' not in updates:
        try:
            updates['level'] = level_from_xp(int(updates['xp']))
        except Exception:
            pass

    updated = await db.update_user(clerk_user_id, updates)
    return updated
