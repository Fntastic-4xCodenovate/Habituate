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

# Extra Life System
EXTRA_LIFE_STREAK_THRESHOLD = 100  # 100 consecutive days
EXTRA_LIFE_REWARD = 1  # Number of extra lives awarded

# Clan Level Thresholds (same logic as user levels)
CLAN_LEVEL_XP_THRESHOLDS = {
    1: 0,
    2: 500,      # 5x user requirement (more members contributing)
    3: 1000,
    4: 2000,
    5: 3000,
    6: 4500,
    7: 6500,
    8: 9000,
    9: 12000,
    10: 15500,
    11: 20000,
    12: 25000,
    13: 31250,
    14: 37500,
    15: 45000,
    16: 55000,
    17: 67500,
    18: 82500,
    19: 100000,
    20: 125000,
}

# Level progression with custom XP requirements
LEVEL_XP_THRESHOLDS = {
    1: 0,
    2: 200,
    3: 400,
    4: 800,
    5: 1200,
    6: 1800,
    7: 2600,
    8: 3600,
    9: 4800,
    10: 6200,
    11: 8000,
    12: 10000,
    13: 12500,
    14: 15000,
    15: 18000,
    16: 22000,
    17: 27000,
    18: 33000,
    19: 40000,
    20: 50000,
}

def calculate_xp_for_level(level: int) -> int:
    """Calculate XP required to reach a level"""
    if level in LEVEL_XP_THRESHOLDS:
        return LEVEL_XP_THRESHOLDS[level]
    # For levels beyond 20, continue scaling pattern
    if level > 20:
        # Extrapolate based on the last known pattern
        diff = LEVEL_XP_THRESHOLDS[20] - LEVEL_XP_THRESHOLDS[19]
        return LEVEL_XP_THRESHOLDS[20] + (diff * (level - 20))
    return 0

def calculate_level_from_xp(xp: int) -> int:
    """Calculate level based on total XP"""
    if xp < 0:
        return 1
    
    level = 1
    for lvl in range(20, 0, -1):
        if xp >= LEVEL_XP_THRESHOLDS[lvl]:
            level = lvl
            break
    return level

def get_xp_for_next_level(current_xp: int) -> dict:
    """Get XP progress information for current level"""
    current_level = calculate_level_from_xp(current_xp)
    next_level = current_level + 1
    
    current_level_xp = LEVEL_XP_THRESHOLDS.get(current_level, 0)
    next_level_xp = calculate_xp_for_level(next_level)
    
    xp_into_level = current_xp - current_level_xp
    xp_needed = next_level_xp - current_xp
    xp_for_level = next_level_xp - current_level_xp
    
    progress_percentage = (xp_into_level / xp_for_level * 100) if xp_for_level > 0 else 0
    
    return {
        'current_level': current_level,
        'next_level': next_level,
        'current_xp': current_xp,
        'xp_into_level': xp_into_level,
        'xp_needed_for_next': xp_needed,
        'xp_required_for_level': xp_for_level,
        'progress_percentage': round(progress_percentage, 2)
    }

# Clan Level Functions (same logic as user levels)
def calculate_clan_xp_for_level(level: int) -> int:
    """Calculate XP required for clan to reach a level"""
    if level in CLAN_LEVEL_XP_THRESHOLDS:
        return CLAN_LEVEL_XP_THRESHOLDS[level]
    if level > 20:
        diff = CLAN_LEVEL_XP_THRESHOLDS[20] - CLAN_LEVEL_XP_THRESHOLDS[19]
        return CLAN_LEVEL_XP_THRESHOLDS[20] + (diff * (level - 20))
    return 0

def calculate_clan_level_from_xp(xp: int) -> int:
    """Calculate clan level based on total XP"""
    if xp < 0:
        return 1
    
    level = 1
    for lvl in range(20, 0, -1):
        if xp >= CLAN_LEVEL_XP_THRESHOLDS[lvl]:
            level = lvl
            break
    return level

def get_clan_xp_progress(current_xp: int) -> dict:
    """Get XP progress information for clan level"""
    current_level = calculate_clan_level_from_xp(current_xp)
    next_level = current_level + 1
    
    current_level_xp = CLAN_LEVEL_XP_THRESHOLDS.get(current_level, 0)
    next_level_xp = calculate_clan_xp_for_level(next_level)
    
    xp_into_level = current_xp - current_level_xp
    xp_needed = next_level_xp - current_xp
    xp_for_level = next_level_xp - current_level_xp
    
    progress_percentage = (xp_into_level / xp_for_level * 100) if xp_for_level > 0 else 0
    
    return {
        'current_level': current_level,
        'next_level': next_level,
        'current_xp': current_xp,
        'xp_into_level': xp_into_level,
        'xp_needed_for_next': xp_needed,
        'xp_required_for_level': xp_for_level,
        'progress_percentage': round(progress_percentage, 2)
    }
