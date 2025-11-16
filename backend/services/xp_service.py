from typing import Optional
from datetime import datetime
from models.user import calculate_level_from_xp, calculate_xp_for_level, XP_CONFIG, EXTRA_LIFE_STREAK_THRESHOLD
from services.badge_service import BadgeService
from services.database import Database
import posthog

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
        new_level = calculate_level_from_xp(new_xp)
        
        # Update user XP and level
        await self.db.update_user(user_id, {
            'xp': new_xp,
            'level': new_level,
            'total_points': user['total_points'] + xp_amount
        })
        
        # Track in PostHog
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
        
        return {
            'xp_awarded': xp_amount,
            'total_xp': new_xp,
            'old_level': old_level,
            'new_level': new_level,
            'level_ups': level_ups,
            'reason': reason
        }
    
    async def _handle_level_up(self, user_id: str, new_level: int):
        """Handle level up rewards and badges"""
        posthog.capture(user_id, 'level_up', {'level': new_level})
        
        # Check for level badges
        await self.badge_service.check_level_badges(user_id, new_level)
        
        # Award bonus XP for milestone levels
        if new_level % 5 == 0:
            bonus_xp = new_level * 10
            posthog.capture(user_id, 'milestone_bonus', {
                'level': new_level,
                'bonus_xp': bonus_xp
            })
    
    async def _contribute_clan_xp(self, user_id: str, clan_id: str, xp_amount: int):
        """Contribute XP to user's clan"""
        # Update clan total XP
        await self.db.increment_clan_xp(clan_id, xp_amount)
        
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
            100: ('century', 500),  # Special bonus + extra life
            365: ('yearly', 1000)
        }
        
        if streak in bonuses:
            bonus_type, xp_amount = bonuses[streak]
            result = await self.award_xp(user_id, xp_amount, f'{bonus_type}_streak_bonus')
            
            # Award extra life at 100 streak
            if streak == EXTRA_LIFE_STREAK_THRESHOLD:
                await self.award_extra_life(user_id)
                result['extra_life_awarded'] = True
            
            return result
        
        return None
    
    async def award_extra_life(self, user_id: str):
        """Award an extra life to a user"""
        user = await self.db.get_user(user_id)
        extra_lives = user.get('extra_lives', 0)
        
        await self.db.update_user(user_id, {
            'extra_lives': extra_lives + 1
        })
        
        posthog.capture(user_id, 'extra_life_earned', {
            'total_lives': extra_lives + 1,
            'reason': '100_day_streak'
        })
        
        # Award special badge
        await self.badge_service.award_badge(user_id, 'Century Club')
