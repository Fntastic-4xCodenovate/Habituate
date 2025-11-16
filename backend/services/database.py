from supabase import create_client, Client
from config import settings
from typing import Optional, List, Dict
from datetime import datetime, date

# Create a global supabase client instance for direct use
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

class Database:
    def __init__(self):
        self.client: Client = supabase
    
    # User operations
    async def get_user(self, user_id: str) -> Optional[dict]:
        response = self.client.table('user_profiles').select('*').eq('clerk_user_id', user_id).execute()
        return response.data[0] if response.data else None
    
    async def create_user(self, user_data: dict) -> dict:
        response = self.client.table('user_profiles').insert(user_data).execute()
        return response.data[0]
    
    async def update_user(self, user_id: str, updates: dict) -> dict:
        response = self.client.table('user_profiles').update(updates).eq('clerk_user_id', user_id).execute()
        return response.data[0]
    
    # Habit operations
    async def get_habit(self, habit_id: str) -> Optional[dict]:
        response = self.client.table('habits').select('*').eq('id', habit_id).execute()
        return response.data[0] if response.data else None
    
    async def get_user_habits(self, user_id: str) -> List[dict]:
        response = self.client.table('habits').select('*').eq('user_id', user_id).execute()
        return response.data
    
    async def create_habit(self, habit_data: dict) -> dict:
        response = self.client.table('habits').insert(habit_data).execute()
        return response.data[0]
    
    async def update_habit(self, habit_id: str, updates: dict) -> dict:
        response = self.client.table('habits').update(updates).eq('id', habit_id).execute()
        return response.data[0]
    
    async def delete_habit(self, habit_id: str):
        self.client.table('habits').delete().eq('id', habit_id).execute()
    
    # Habit completion operations
    async def create_habit_completion(self, habit_id: str, user_id: str, 
                                     xp_earned: int, notes: Optional[str] = None) -> dict:
        completion_data = {
            'habit_id': habit_id,
            'user_id': user_id,
            'xp_earned': xp_earned,
            'notes': notes,
            'completed_at': datetime.now().isoformat()
        }
        response = self.client.table('habit_logs').insert(completion_data).execute()
        return response.data[0]
    
    async def get_last_completion(self, habit_id: str, user_id: str) -> Optional[dict]:
        response = self.client.table('habit_logs') \
            .select('*') \
            .eq('habit_id', habit_id) \
            .eq('user_id', user_id) \
            .order('completed_at', desc=True) \
            .limit(1) \
            .execute()
        return response.data[0] if response.data else None
    
    # Badge operations
    async def create_badge_if_not_exists(self, badge_data: dict):
        existing = self.client.table('badges').select('*').eq('name', badge_data['name']).execute()
        if not existing.data:
            self.client.table('badges').insert(badge_data).execute()
    
    async def get_badge_by_name(self, name: str) -> Optional[dict]:
        response = self.client.table('badges').select('*').eq('name', name).execute()
        return response.data[0] if response.data else None
    
    async def get_badge_by_type_and_requirement(self, badge_type: str, requirement: int) -> Optional[dict]:
        response = self.client.table('badges') \
            .select('*') \
            .eq('badge_type', badge_type) \
            .eq('requirement', requirement) \
            .execute()
        return response.data[0] if response.data else None
    
    async def get_all_badges(self) -> List[dict]:
        response = self.client.table('badges').select('*').execute()
        return response.data
    
    async def user_has_badge(self, user_id: str, badge_id: str) -> bool:
        response = self.client.table('user_badges') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('badge_id', badge_id) \
            .execute()
        return len(response.data) > 0
    
    async def create_user_badge(self, user_id: str, badge_id: str) -> dict:
        badge_data = {
            'user_id': user_id,
            'badge_id': badge_id,
            'earned_at': datetime.now().isoformat()
        }
        response = self.client.table('user_badges').insert(badge_data).execute()
        return response.data[0]
    
    async def get_user_badges(self, user_id: str) -> List[dict]:
        response = self.client.table('user_badges') \
            .select('*, badges(*)') \
            .eq('user_id', user_id) \
            .execute()
        return response.data
    
    # Clan operations
    async def create_clan(self, clan_data: dict) -> dict:
        response = self.client.table('clans').insert(clan_data).execute()
        return response.data[0]
    
    async def get_clan(self, clan_id: str) -> Optional[dict]:
        response = self.client.table('clans').select('*').eq('id', clan_id).execute()
        return response.data[0] if response.data else None
    
    async def update_clan(self, clan_id: str, updates: dict) -> dict:
        response = self.client.table('clans').update(updates).eq('id', clan_id).execute()
        return response.data[0]
    
    async def increment_clan_xp(self, clan_id: str, xp_amount: int):
        clan = await self.get_clan(clan_id)
        new_xp = clan['total_xp'] + xp_amount
        await self.update_clan(clan_id, {'total_xp': new_xp})
    
    async def join_clan(self, clan_id: str, user_id: str, username: str) -> dict:
        member_data = {
            'clan_id': clan_id,
            'user_id': user_id,
            'username': username,
            'xp_contributed': 0,
            'role': 'member',
            'joined_at': datetime.now().isoformat()
        }
        response = self.client.table('clan_members').insert(member_data).execute()
        
        # Update user's clan_id
        await self.update_user(user_id, {'clan_id': clan_id})
        
        # Increment clan member count
        clan = await self.get_clan(clan_id)
        await self.update_clan(clan_id, {'member_count': clan['member_count'] + 1})
        
        return response.data[0]
    
    async def get_clan_members(self, clan_id: str) -> List[dict]:
        response = self.client.table('clan_members').select('*').eq('clan_id', clan_id).execute()
        return response.data
    
    async def increment_clan_member_contribution(self, clan_id: str, user_id: str, xp_amount: int):
        member = self.client.table('clan_members') \
            .select('*') \
            .eq('clan_id', clan_id) \
            .eq('user_id', user_id) \
            .execute()
        
        if member.data:
            new_contribution = member.data[0]['xp_contributed'] + xp_amount
            self.client.table('clan_members') \
                .update({'xp_contributed': new_contribution}) \
                .eq('clan_id', clan_id) \
                .eq('user_id', user_id) \
                .execute()
    
    async def get_clan_member_contribution(self, clan_id: str, user_id: str) -> int:
        response = self.client.table('clan_members') \
            .select('xp_contributed') \
            .eq('clan_id', clan_id) \
            .eq('user_id', user_id) \
            .execute()
        return response.data[0]['xp_contributed'] if response.data else 0
    
    async def create_clan_message(self, message_data: dict) -> dict:
        response = self.client.table('clan_messages').insert(message_data).execute()
        return response.data[0]
    
    async def get_clan_messages(self, clan_id: str, limit: int = 50) -> List[dict]:
        response = self.client.table('clan_messages') \
            .select('*') \
            .eq('clan_id', clan_id) \
            .order('timestamp', desc=True) \
            .limit(limit) \
            .execute()
        return response.data
    
    # Leaderboard operations
    async def get_leaderboard(self, limit: int = 100) -> List[dict]:
        response = self.client.table('user_profiles') \
            .select('*') \
            .order('total_points', desc=True) \
            .limit(limit) \
            .execute()
        return response.data
    
    async def get_clan_leaderboard(self, limit: int = 50) -> List[dict]:
        response = self.client.table('clans') \
            .select('*') \
            .order('total_xp', desc=True) \
            .limit(limit) \
            .execute()
        return response.data
    
    # Quest operations
    async def get_active_quests(self, user_id: str) -> List[dict]:
        response = self.client.table('user_quests') \
            .select('*, quests(*)') \
            .eq('user_id', user_id) \
            .eq('status', 'active') \
            .execute()
        return response.data
    
    async def update_quest_progress(self, user_quest_id: str, progress: int):
        self.client.table('user_quests') \
            .update({'progress': progress}) \
            .eq('id', user_quest_id) \
            .execute()
