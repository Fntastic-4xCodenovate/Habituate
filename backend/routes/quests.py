from fastapi import APIRouter
from services.database import Database

router = APIRouter()
db = Database()

@router.get("/active/{user_id}")
async def get_active_quests(user_id: str):
    """Get all active quests for a user"""
    quests = await db.get_active_quests(user_id)
    return {'quests': quests}

@router.post("/{quest_id}/progress")
async def update_quest_progress(user_quest_id: str, progress: int):
    """Update progress on a quest"""
    await db.update_quest_progress(user_quest_id, progress)
    return {'message': 'Quest progress updated'}

@router.get("/daily")
async def get_daily_quests():
    """Get available daily quests"""
    from models.quest import DAILY_QUESTS
    return {'quests': DAILY_QUESTS}

@router.get("/weekly")
async def get_weekly_quests():
    """Get available weekly quests"""
    from models.quest import WEEKLY_QUESTS
    return {'quests': WEEKLY_QUESTS}
