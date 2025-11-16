from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    frequency: str  # daily, weekly
    category: Optional[str] = None
    difficulty: str = "medium"  # easy, medium, hard
    is_public: bool = False

class HabitCreate(HabitBase):
    user_id: str

class Habit(HabitBase):
    id: str
    user_id: str
    streak: int = 0
    best_streak: int = 0
    total_completions: int = 0
    last_completed: Optional[datetime] = None
    missed_days: int = 0
    used_extra_life: bool = False
    extra_life_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

class HabitCompletion(BaseModel):
    id: str
    habit_id: str
    user_id: str
    completed_at: datetime
    xp_earned: int = 0
    notes: Optional[str] = None

class HabitWithStats(Habit):
    completion_rate: float = 0.0
    xp_earned: int = 0
    can_use_extra_life: bool = False

class MissedDay(BaseModel):
    habit_id: str
    user_id: str
    missed_date: date
    can_redeem: bool
    extra_life_available: bool

class ExtraLifeRedemption(BaseModel):
    habit_id: str
    user_id: str
    date_to_restore: date
    success: bool
    message: str
