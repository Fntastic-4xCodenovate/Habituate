from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class BadgeType(str, Enum):
    STREAK = "streak"
    COMPLETION = "completion"
    LEVEL = "level"
    SOCIAL = "social"
    CLAN = "clan"
    SPECIAL = "special"

class BadgeRarity(str, Enum):
    COMMON = "common"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"

class BadgeBase(BaseModel):
    name: str
    description: str
    icon: str
    badge_type: BadgeType
    rarity: BadgeRarity
    requirement: int
    xp_reward: int = 30

class Badge(BadgeBase):
    id: str
    created_at: datetime

class UserBadge(BaseModel):
    id: str
    user_id: str
    badge_id: str
    earned_at: datetime
    badge_details: Optional[Badge] = None

# Predefined badges
BADGE_DEFINITIONS = [
    # Streak Badges
    {"name": "First Steps", "description": "Complete your first habit", "icon": "🎯", 
     "badge_type": "streak", "rarity": "common", "requirement": 1, "xp_reward": 10},
    
    {"name": "Week Warrior", "description": "Maintain a 7-day streak", "icon": "🔥", 
     "badge_type": "streak", "rarity": "common", "requirement": 7, "xp_reward": 25},
    
    {"name": "Monthly Master", "description": "Maintain a 30-day streak", "icon": "💪", 
     "badge_type": "streak", "rarity": "rare", "requirement": 30, "xp_reward": 100},
    
    {"name": "Century Club", "description": "Reach 100-day streak", "icon": "💎", 
     "badge_type": "streak", "rarity": "epic", "requirement": 100, "xp_reward": 500},
    
    {"name": "Legendary Streak", "description": "Maintain a 365-day streak", "icon": "👑", 
     "badge_type": "streak", "rarity": "legendary", "requirement": 365, "xp_reward": 1000},
    
    # Completion Badges
    {"name": "Habit Starter", "description": "Complete 10 habits", "icon": "⭐", 
     "badge_type": "completion", "rarity": "common", "requirement": 10, "xp_reward": 20},
    
    {"name": "Habit Builder", "description": "Complete 50 habits", "icon": "🌟", 
     "badge_type": "completion", "rarity": "rare", "requirement": 50, "xp_reward": 75},
    
    {"name": "Habit Master", "description": "Complete 100 habits", "icon": "✨", 
     "badge_type": "completion", "rarity": "epic", "requirement": 100, "xp_reward": 200},
    
    # Level Badges
    {"name": "Novice", "description": "Reach level 5", "icon": "🥉", 
     "badge_type": "level", "rarity": "common", "requirement": 5, "xp_reward": 50},
    
    {"name": "Expert", "description": "Reach level 10", "icon": "🥈", 
     "badge_type": "level", "rarity": "rare", "requirement": 10, "xp_reward": 100},
    
    {"name": "Elite", "description": "Reach level 20", "icon": "🥇", 
     "badge_type": "level", "rarity": "epic", "requirement": 20, "xp_reward": 250},
    
    # Social Badges
    {"name": "Team Player", "description": "Join a clan", "icon": "🤝", 
     "badge_type": "social", "rarity": "common", "requirement": 1, "xp_reward": 15},
    
    {"name": "Clan Contributor", "description": "Contribute 500 XP to clan", "icon": "🏆", 
     "badge_type": "clan", "rarity": "rare", "requirement": 500, "xp_reward": 100},
    
    {"name": "Clan Legend", "description": "Contribute 5000 XP to clan", "icon": "👑", 
     "badge_type": "clan", "rarity": "legendary", "requirement": 5000, "xp_reward": 500},
    
    # Special Badges
    {"name": "Perfectionist", "description": "Complete all habits for 30 days", "icon": "💯", 
     "badge_type": "special", "rarity": "epic", "requirement": 30, "xp_reward": 300},
]
