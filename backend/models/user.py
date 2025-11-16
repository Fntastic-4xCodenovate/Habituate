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
    if xp < 0:
        return 1
    
    level = 1
    total_required = 0
    
    while True:
        # XP required for current level
        level_xp = calculate_xp_for_level(level)
        
        # If current XP is less than what's needed for next level
        if xp < total_required + level_xp:
            return level
        
        # Add this level's requirement to total
        total_required += level_xp
        level += 1
        
        # Safety check to prevent infinite loop
        if level > 200:
            return 200

def get_xp_progress(xp: int) -> dict:
    """Get detailed XP progress information"""
    current_level = calculate_level_from_xp(xp)
    
    # Calculate total XP needed for current level
    total_for_current = 0
    for i in range(1, current_level):
        total_for_current += calculate_xp_for_level(i)
    
    # XP needed for next level
    xp_for_next_level = calculate_xp_for_level(current_level + 1)
    
    # Progress within current level
    xp_in_current_level = xp - total_for_current
    
    return {
        'current_level': current_level,
        'total_xp': xp,
        'xp_in_current_level': xp_in_current_level,
        'xp_needed_for_next': xp_for_next_level,
        'xp_remaining': xp_for_next_level - xp_in_current_level,
        'progress_percentage': (xp_in_current_level / xp_for_next_level) * 100 if xp_for_next_level > 0 else 100
    }
