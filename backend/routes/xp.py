from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.xp_service import XPService
from services.database import Database

router = APIRouter()
xp_service = XPService()
db = Database()

class AwardXPRequest(BaseModel):
    user_id: str
    xp_amount: int
    reason: str = "manual_award"

@router.post("/award")
async def award_xp(request: AwardXPRequest):
    """Award XP to a user (for testing/admin purposes)"""
    try:
        result = await xp_service.award_xp(
            request.user_id,
            request.xp_amount,
            request.reason
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}")
async def get_user_xp(user_id: str):
    """Get user's current XP and level"""
    try:
        user = await db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            'user_id': user_id,
            'xp': user['xp'],
            'level': user['level'],
            'total_points': user['total_points']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-level-up")
async def test_level_up(user_id: str, target_level: int):
    """Award enough XP to reach a target level (for testing)"""
    from models.user import calculate_xp_for_level, calculate_level_from_xp
    
    try:
        user = await db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        current_xp = user['xp']
        target_xp = calculate_xp_for_level(target_level)
        
        if current_xp >= target_xp:
            return {
                'message': f'User already has {current_xp} XP (level {calculate_level_from_xp(current_xp)}), which is >= level {target_level} requirement ({target_xp} XP)',
                'current_xp': current_xp,
                'current_level': calculate_level_from_xp(current_xp),
                'target_level': target_level,
                'target_xp': target_xp
            }
        
        xp_needed = target_xp - current_xp
        
        result = await xp_service.award_xp(
            user_id,
            xp_needed,
            f"test_level_up_to_{target_level}"
        )
        
        return {
            'message': f'Successfully awarded {xp_needed} XP to reach level {target_level}',
            'xp_awarded': xp_needed,
            'result': result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))