from fastapi import APIRouter, HTTPException, Depends
from models.habit import HabitCreate, Habit, HabitCompletion
from services.streak_service import StreakService
from services.database import Database
from typing import List
from datetime import date

router = APIRouter()
db = Database()
streak_service = StreakService()

@router.post("/", response_model=Habit)
async def create_habit(habit: HabitCreate):
    """Create a new habit"""
    habit_data = habit.dict()
    habit_data['streak'] = 0
    habit_data['best_streak'] = 0
    habit_data['total_completions'] = 0
    
    created_habit = await db.create_habit(habit_data)
    return created_habit

@router.get("/user/{user_id}", response_model=List[Habit])
async def get_user_habits(user_id: str):
    """Get all habits for a user"""
    habits = await db.get_user_habits(user_id)
    return habits

@router.get("/{habit_id}", response_model=Habit)
async def get_habit(habit_id: str):
    """Get a specific habit"""
    habit = await db.get_habit(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@router.post("/{habit_id}/complete")
async def complete_habit(habit_id: str, user_id: str, notes: str = None):
    """Complete a habit for today"""
    result = await streak_service.complete_habit(user_id, habit_id, notes)
    return result

@router.post("/extra-life/use")
async def use_extra_life(user_id: str, habit_id: str, date_to_restore: date):
    """Use an extra life to restore a broken streak"""
    result = await streak_service.use_extra_life(user_id, habit_id, date_to_restore)
    return result

@router.get("/missed-days/{user_id}")
async def check_missed_days(user_id: str):
    """Check for missed habit completions"""
    missed = await streak_service.check_missed_days(user_id)
    return {'missed_days': missed}

@router.get("/stats/{user_id}")
async def get_streak_stats(user_id: str):
    """Get comprehensive streak statistics"""
    stats = await streak_service.get_streak_stats(user_id)
    return stats

@router.put("/{habit_id}")
async def update_habit(habit_id: str, updates: dict):
    """Update a habit"""
    habit = await db.get_habit(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    updated = await db.update_habit(habit_id, updates)
    return updated

@router.delete("/{habit_id}")
async def delete_habit(habit_id: str):
    """Delete a habit"""
    habit = await db.get_habit(habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    await db.delete_habit(habit_id)
    return {'message': 'Habit deleted successfully'}
