from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

class QuestType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    SPECIAL = "special"

class QuestStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    EXPIRED = "expired"

class QuestBase(BaseModel):
    title: str
    description: str
    quest_type: QuestType
    xp_reward: int
    requirement: int
    requirement_type: str  # completions, streak, clan_xp, etc.
    expires_at: Optional<datetime> = None

class Quest(QuestBase):
    id: str
    created_at: datetime

class UserQuest(BaseModel):
    id: str
    user_id: str
    quest_id: str
    status: QuestStatus
    progress: int = 0
    completed_at: Optional[datetime] = None
    quest_details: Optional[Quest] = None

# Daily Quests (reset every day)
DAILY_QUESTS = [
    {"title": "Morning Momentum", "description": "Complete 3 habits before noon",
     "quest_type": "daily", "xp_reward": 50, "requirement": 3, "requirement_type": "morning_completions"},
    
    {"title": "Perfect Day", "description": "Complete all your habits today",
     "quest_type": "daily", "xp_reward": 75, "requirement": 1, "requirement_type": "all_habits_complete"},
    
    {"title": "Streak Keeper", "description": "Maintain all your streaks today",
     "quest_type": "daily", "xp_reward": 30, "requirement": 1, "requirement_type": "maintain_streaks"},
]

# Weekly Quests (reset every week)
WEEKLY_QUESTS = [
    {"title": "Weekly Warrior", "description": "Complete 20 habits this week",
     "quest_type": "weekly", "xp_reward": 200, "requirement": 20, "requirement_type": "completions"},
    
    {"title": "Clan Hero", "description": "Contribute 500 XP to your clan this week",
     "quest_type": "weekly", "xp_reward": 150, "requirement": 500, "requirement_type": "clan_xp"},
    
    {"title": "Social Butterfly", "description": "Send 10 messages in clan chat",
     "quest_type": "weekly", "xp_reward": 100, "requirement": 10, "requirement_type": "clan_messages"},
]
