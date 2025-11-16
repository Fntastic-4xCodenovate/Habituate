from fastapi import APIRouter, Query
from services.database import Database
from typing import List, Optional

router = APIRouter()
db = Database()

@router.get("/habits")
async def discover_habits(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20
):
    """Discover public habits created by other users"""
    # This would query public habits from all users
    # For now, returning a mock response
    
    habits = await db.client.table('habits') \
        .select('*') \
        .eq('is_public', True) \
        .limit(limit) \
        .execute()
    
    return {'habits': habits.data}

@router.get("/popular")
async def get_popular_habits(limit: int = 10):
    """Get most popular public habits"""
    # This would aggregate habits by adoption count
    habits = await db.client.table('habits') \
        .select('*') \
        .eq('is_public', True) \
        .order('total_completions', desc=True) \
        .limit(limit) \
        .execute()
    
    return {'habits': habits.data}

@router.get("/categories")
async def get_habit_categories():
    """Get all habit categories"""
    categories = [
        {'name': 'Health & Fitness', 'icon': '💪', 'count': 0},
        {'name': 'Mindfulness', 'icon': '🧘', 'count': 0},
        {'name': 'Learning', 'icon': '📚', 'count': 0},
        {'name': 'Productivity', 'icon': '⚡', 'count': 0},
        {'name': 'Social', 'icon': '👥', 'count': 0},
        {'name': 'Creative', 'icon': '🎨', 'count': 0},
        {'name': 'Finance', 'icon': '💰', 'count': 0},
        {'name': 'Other', 'icon': '✨', 'count': 0}
    ]
    
    return {'categories': categories}

@router.post("/habits/{habit_id}/adopt")
async def adopt_habit(habit_id: str, user_id: str):
    """Adopt a public habit from another user"""
    original_habit = await db.get_habit(habit_id)
    if not original_habit or not original_habit.get('is_public'):
        return {'success': False, 'message': 'Habit not found or not public'}
    
    # Create a copy for the user
    new_habit_data = {
        'user_id': user_id,
        'title': original_habit['title'],
        'description': original_habit['description'],
        'frequency': original_habit['frequency'],
        'category': original_habit['category'],
        'difficulty': original_habit['difficulty'],
        'is_public': False,
        'streak': 0,
        'best_streak': 0,
        'total_completions': 0
    }
    
    new_habit = await db.create_habit(new_habit_data)
    
    return {
        'success': True,
        'message': 'Habit adopted successfully',
        'habit': new_habit
    }
