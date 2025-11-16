from fastapi import APIRouter, HTTPException
from models.clan import ClanCreate, Clan, ClanMessage
from services.database import Database
from services.websocket_manager import ConnectionManager
from typing import List
from datetime import datetime

router = APIRouter()
db = Database()
manager = ConnectionManager()

@router.post("/", response_model=Clan)
async def create_clan(clan: ClanCreate):
    """Create a new clan"""
    clan_data = clan.dict()
    clan_data['total_xp'] = 0
    clan_data['level'] = 1
    clan_data['member_count'] = 1
    
    created_clan = await db.create_clan(clan_data)
    
    # Add owner as first member
    await db.join_clan(
        created_clan['id'],
        clan.owner_id,
        'Owner'  # Replace with actual username
    )
    
    return created_clan

@router.get("/{clan_id}", response_model=Clan)
async def get_clan(clan_id: str):
    """Get clan details"""
    clan = await db.get_clan(clan_id)
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    return clan

@router.post("/{clan_id}/join")
async def join_clan(clan_id: str, user_id: str, username: str):
    """Join a clan"""
    clan = await db.get_clan(clan_id)
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    
    if clan['member_count'] >= clan['max_members']:
        raise HTTPException(status_code=400, detail="Clan is full")
    
    member = await db.join_clan(clan_id, user_id, username)
    
    # Notify clan members
    await manager.notify_clan(clan_id, 'member_joined', {
        'user_id': user_id,
        'username': username
    })
    
    return {'message': 'Joined clan successfully', 'member': member}

@router.get("/{clan_id}/members")
async def get_clan_members(clan_id: str):
    """Get all clan members"""
    members = await db.get_clan_members(clan_id)
    
    # Sort by XP contribution
    members.sort(key=lambda m: m.get('xp_contributed', 0), reverse=True)
    
    return {'members': members}

@router.post("/{clan_id}/messages")
async def send_clan_message(clan_id: str, user_id: str, username: str, message: str, avatar: str = '/avatars/default.png'):
    """Send a message in clan chat"""
    try:
        from services.database import supabase
        
        message_data = {
            'clan_id': clan_id,
            'user_id': user_id,
            'username': username,
            'message': message,
            'avatar': avatar,
            'timestamp': datetime.now().isoformat()
        }
        
        response = supabase.table('clan_messages')\
            .insert(message_data)\
            .execute()
        
        if response.data:
            return response.data[0]
        
        return message_data
    except Exception as e:
        print(f"Error creating message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{clan_id}/messages")
async def get_clan_messages(clan_id: str, limit: int = 50):
    """Get clan chat messages"""
    try:
        from services.database import supabase
        
        response = supabase.table('clan_messages')\
            .select('*')\
            .eq('clan_id', clan_id)\
            .order('timestamp', desc=True)\
            .limit(limit)\
            .execute()
        
        # Reverse to get chronological order
        messages = list(reversed(response.data)) if response.data else []
        
        return {'messages': messages}
    except Exception as e:
        print(f"Error fetching messages: {e}")
        return {'messages': []}

@router.get("/{clan_id}/stats")
async def get_clan_stats(clan_id: str):
    """Get clan statistics"""
    clan = await db.get_clan(clan_id)
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    
    members = await db.get_clan_members(clan_id)
    top_contributors = sorted(
        members,
        key=lambda m: m.get('xp_contributed', 0),
        reverse=True
    )[:5]
    
    # Get clan rank
    leaderboard = await db.get_clan_leaderboard(1000)
    rank = next((i + 1 for i, c in enumerate(leaderboard) if c['id'] == clan_id), None)
    
    return {
        'total_xp': clan['total_xp'],
        'level': clan['level'],
        'member_count': clan['member_count'],
        'rank': rank,
        'top_contributors': top_contributors
    }
