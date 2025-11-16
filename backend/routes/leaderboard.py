from fastapi import APIRouter, HTTPException
from services.database import Database
from typing import List

router = APIRouter()
db = Database()

@router.get("/users")
async def get_user_leaderboard(limit: int = 100):
    """Get user leaderboard ranked by total points"""
    leaderboard = await db.get_leaderboard(limit)
    
    # Add rank to each user
    for idx, user in enumerate(leaderboard, 1):
        user['rank'] = idx
    
    return {
        'leaderboard': leaderboard,
        'total_users': len(leaderboard)
    }

@router.get("/clans")
async def get_clan_leaderboard(limit: int = 50):
    """Get clan leaderboard ranked by total XP"""
    leaderboard = await db.get_clan_leaderboard(limit)
    
    # Add rank and get top contributors for each clan
    for idx, clan in enumerate(leaderboard, 1):
        clan['rank'] = idx
        members = await db.get_clan_members(clan['id'])
        top_contributors = sorted(
            members,
            key=lambda m: m.get('xp_contributed', 0),
            reverse=True
        )[:3]
        clan['top_contributors'] = top_contributors
    
    return {
        'leaderboard': leaderboard,
        'total_clans': len(leaderboard)
    }

@router.get("/user/{user_id}/rank")
async def get_user_rank(user_id: str):
    """Get a specific user's rank"""
    leaderboard = await db.get_leaderboard(1000)
    
    for idx, user in enumerate(leaderboard, 1):
        if user['clerk_user_id'] == user_id:
            return {
                'rank': idx,
                'total_users': len(leaderboard),
                'user': user
            }
    
    raise HTTPException(status_code=404, detail="User not found in leaderboard")
