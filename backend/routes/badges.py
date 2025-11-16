from fastapi import APIRouter, HTTPException
from services.badge_service import BadgeService
from typing import List

router = APIRouter()
badge_service = BadgeService()

@router.get("/user/{user_id}")
async def get_user_badges(user_id: str):
    """Get all badges earned by a user"""
    badges = await badge_service.get_user_badges(user_id)
    return {'badges': badges}

@router.get("/user/{user_id}/progress")
async def get_badge_progress(user_id: str):
    """Get user's progress towards all badges"""
    progress = await badge_service.get_badge_progress(user_id)
    return progress

@router.post("/check/{user_id}")
async def check_badges(user_id: str):
    """Check and award any new badges for a user"""
    await badge_service.check_and_award_badges(user_id)
    return {'message': 'Badges checked and awarded'}

@router.get("/all")
async def get_all_badges():
    """Get all available badges"""
    from services.database import Database
    db = Database()
    badges = await db.get_all_badges()
    return {'badges': badges}
