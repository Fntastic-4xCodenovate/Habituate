from typing import Optional
from datetime import datetime
from models.user import XP_CONFIG, EXTRA_LIFE_STREAK_THRESHOLD, calculate_clan_level_from_xp, get_clan_xp_progress
from services.leveling import level_from_xp, progress_from_xp, check_level_up
from services.badge_service import BadgeService
from services.database import Database
from config import settings
try:
    import posthog
    if settings.POSTHOG_API_KEY:
        posthog.api_key = settings.POSTHOG_API_KEY
        posthog.host = settings.POSTHOG_HOST
        POSTHOG_ENABLED = True
    else:
        POSTHOG_ENABLED = False
except ImportError:
    POSTHOG_ENABLED = False

class XPService:
    def __init__(self):
        self.db = Database()
        self.badge_service = BadgeService()
    
    async def award_xp(self, user_id: str, xp_amount: int, reason: str) -> dict:
        """Award XP to a user and handle level ups"""
        # Get current user data
        user = await self.db.get_user(user_id)
        
        old_xp = user['xp']
        old_level = user['level']
        
        new_xp = old_xp + xp_amount
        new_level = level_from_xp(new_xp)
        
        # Update user XP and level
        await self.db.update_user(user_id, {
            'xp': new_xp,
            'level': new_level,
            'total_points': user['total_points'] + xp_amount
        })
        
        # Track in PostHog
        if POSTHOG_ENABLED:
            posthog.capture(
                user_id,
                'xp_awarded',
                {
                    'amount': xp_amount,
                    'reason': reason,
                    'new_xp': new_xp,
                    'new_level': new_level
                }
            )
        
        # Check for level up
        level_ups = []
        if new_level > old_level:
            for level in range(old_level + 1, new_level + 1):
                level_ups.append(level)
                await self._handle_level_up(user_id, level)
        
        # If user is in a clan, contribute to clan XP
        if user.get('clan_id'):
            await self._contribute_clan_xp(user_id, user['clan_id'], xp_amount)
        
        # Get level progress info
        level_progress = progress_from_xp(new_xp)
        
        return {
            'xp_awarded': xp_amount,
            'total_xp': new_xp,
            'old_level': old_level,
            'new_level': new_level,
            'level_ups': level_ups,
            'reason': reason,
            'level_progress': level_progress
        }
    
    async def _handle_level_up(self, user_id: str, new_level: int):
        """Handle level up rewards and badges"""
        if POSTHOG_ENABLED:
            posthog.capture(user_id, 'level_up', {'level': new_level})
        
        # Check for level badges
        await self.badge_service.check_level_badges(user_id, new_level)
        
        # Award bonus XP for milestone levels
        if new_level % 5 == 0:
            bonus_xp = new_level * 10
            if POSTHOG_ENABLED:
                posthog.capture(user_id, 'milestone_bonus', {
                    'level': new_level,
                    'bonus_xp': bonus_xp
                })
    
    async def _contribute_clan_xp(self, user_id: str, clan_id: str, xp_amount: int):
        """Contribute XP to user's clan and handle clan level ups"""
        # Get current clan data
        clan = await self.db.get_clan(clan_id)
        old_clan_xp = clan.get('total_xp', 0)
        old_clan_level = clan.get('level', 1)
        
        # Update clan total XP
        new_clan_xp = old_clan_xp + xp_amount
        await self.db.increment_clan_xp(clan_id, xp_amount)
        
        # Calculate new clan level
        new_clan_level = calculate_clan_level_from_xp(new_clan_xp)
        
        # Update clan level if it changed
        if new_clan_level > old_clan_level:
            await self.db.update_clan(clan_id, {'level': new_clan_level})
            
            # Track clan level up in PostHog
            if POSTHOG_ENABLED:
                posthog.capture(
                    f'clan_{clan_id}',
                    'clan_level_up',
                    {
                        'clan_id': clan_id,
                        'old_level': old_clan_level,
                        'new_level': new_clan_level,
                        'total_xp': new_clan_xp,
                        'contributing_user': user_id
                    }
                )
        
        # Update user's contribution
        await self.db.increment_clan_member_contribution(clan_id, user_id, xp_amount)
        
        # Check for clan contribution badges
        member_contribution = await self.db.get_clan_member_contribution(clan_id, user_id)
        await self.badge_service.check_clan_badges(user_id, member_contribution)
    
    async def calculate_habit_xp(self, habit_difficulty: str, streak: int) -> int:
        """Calculate XP for completing a habit based on difficulty and streak"""
        base_xp = XP_CONFIG['HABIT_COMPLETE']
        
        # Difficulty multiplier
        difficulty_multipliers = {
            'easy': 1.0,
            'medium': 1.5,
            'hard': 2.0
        }
        multiplier = difficulty_multipliers.get(habit_difficulty, 1.0)
        
        # Streak bonus (5% per 10 days, max 50%)
        streak_bonus = min(streak // 10 * 0.05, 0.5)
        
        xp = int(base_xp * multiplier * (1 + streak_bonus))
        return xp
    
    async def award_streak_bonus(self, user_id: str, streak: int) -> Optional[dict]:
        """Award bonus XP for streak milestones"""
        bonuses = {
            7: ('weekly', XP_CONFIG['WEEKLY_STREAK']),
            30: ('monthly', XP_CONFIG['MONTHLY_STREAK']),
            100: ('century', 500),
            365: ('yearly', 1000)
        }
        
        result = None
        if streak in bonuses:
            bonus_type, xp_amount = bonuses[streak]
            result = await self.award_xp(user_id, xp_amount, f'{bonus_type}_streak_bonus')
        
        # Award extra life for 100-day streak milestone
        if streak == EXTRA_LIFE_STREAK_THRESHOLD:
            await self.award_extra_life(user_id, 'century_streak')
            
        return result
    
    async def award_extra_life(self, user_id: str, reason: str) -> dict:
        """Award an extra life to the user"""
        # Get current user data
        user = await self.db.get_user(user_id)
        current_lives = user.get('extra_lives', 0)
        new_lives = current_lives + 1
        
        # Update user's extra lives
        await self.db.update_user(user_id, {'extra_lives': new_lives})
        
        # Track in PostHog
        if POSTHOG_ENABLED:
            posthog.capture(
                user_id,
                'extra_life_awarded',
                {
                    'reason': reason,
                    'new_total': new_lives,
                    'previous_total': current_lives
                }
            )
        
        return {
            'extra_life_awarded': True,
            'reason': reason,
            'total_extra_lives': new_lives
        }
    
    async def get_clan_progress(self, clan_id: str) -> dict:
        """Get clan XP and level progress information"""
        clan = await self.db.get_clan(clan_id)
        total_xp = clan.get('total_xp', 0)
        current_level = clan.get('level', 1)
        
        progress_info = get_clan_xp_progress(total_xp)
        
        return {
            'clan_id': clan_id,
            'total_xp': total_xp,
            'current_level': current_level,
            'progress_info': progress_info
        }
