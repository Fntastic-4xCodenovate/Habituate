from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ClanBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: str = "🏰"
    is_private: bool = False
    max_members: int = 50

class ClanCreate(ClanBase):
    owner_id: str

class Clan(ClanBase):
    id: str
    owner_id: str
    total_xp: int = 0
    level: int = 1
    member_count: int = 1
    created_at: datetime
    updated_at: datetime

class ClanMember(BaseModel):
    id: str
    clan_id: str
    user_id: str
    username: str
    avatar_url: Optional[str] = None
    xp_contributed: int = 0
    role: str = "member"  # member, moderator, leader
    joined_at: datetime

class ClanInvite(BaseModel):
    id: str
    clan_id: str
    invited_by: str
    invited_user_id: str
    status: str = "pending"  # pending, accepted, rejected
    created_at: datetime

class ClanMessage(BaseModel):
    id: str
    clan_id: str
    user_id: str
    username: str
    message: str
    timestamp: datetime

class ClanLeaderboard(BaseModel):
    rank: int
    clan: Clan
    top_contributors: List[ClanMember]

class ClanStats(BaseModel):
    total_xp: int
    level: int
    member_count: int
    daily_xp: int
    weekly_xp: int
    rank: int
    top_contributors: List[dict]
