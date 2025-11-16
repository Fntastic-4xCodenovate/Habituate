from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    clerk_user_id: str
    username: str
    email: str

class UserProfile(UserBase):
    id: str
    avatar_url: Optional[str] = None
    total_points: int = 0
    level: int = 1
    xp: int = 0
    extra_lives: int = 0
    clan_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class UserStats(BaseModel):
    total_habits: int
    total_completions: int
    current_streak: int
    longest_streak: int
    total_xp: int
    level: int
    badges_earned: int
    clan_xp_contribution: int = 0

class ExtraLife(BaseModel):
    user_id: str
    available: int
    used_on_date: Optional[datetime] = None
    can_use: bool = True

class LevelConfig(BaseModel):
    level: int
    xp_required: int
    rewards: dict = Field(default_factory=dict)

# XP System Configuration
XP_CONFIG = {
    "HABIT_COMPLETE": 10,
    "DAILY_STREAK": 5,
    "WEEKLY_STREAK": 25,
    "MONTHLY_STREAK": 100,
    "QUEST_COMPLETE": 50,
    "BADGE_EARNED": 30,
    "CLAN_CONTRIBUTION": 15,
    "HELP_CLAN_MEMBER": 5,
}

# Level progression (exponential)
def calculate_xp_for_level(level: int) -> int:
    """Calculate XP required to reach a level"""
    base = 100
    multiplier = 1.5
    return int(base * (multiplier ** (level - 1)))

# Extra life system
EXTRA_LIFE_STREAK_THRESHOLD = 100

def calculate_level_from_xp(xp: int) -> int:
    """Calculate level based on total XP"""
    level = 1
    required_xp = 0
    while required_xp <= xp:
        level += 1
        required_xp += calculate_xp_for_level(level)
    return level - 1
