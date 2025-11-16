from typing import List
from models.badge import Badge, UserBadge, BADGE_DEFINITIONS
from services.database import Database
import posthog

class BadgeService:
    def __init__(self):
        self.db = Database()
    
    async def initialize_badges(self):
        """Initialize badge definitions in database"""
        for badge_def in BADGE_DEFINITIONS:
            await self.db.create_badge_if_not_exists(badge_def)
    
    async def check_and_award_badges(self, user_id: str):
        """Check all badge criteria and award new badges"""
        user = await self.db.get_user(user_id)
        habits = await self.db.get_user_habits(user_id)
        
        # Check streak badges
        for habit in habits:
            await self.check_streak_badges(user_id, habit.get('streak', 0))
        
        # Check completion badges
        total_completions = sum(h.get('total_completions', 0) for h in habits)
        await self.check_completion_badges(user_id, total_completions)
        
        # Check level badges
        await self.check_level_badges(user_id, user.get('level', 1))
        
        # Check clan badges
        if user.get('clan_id'):
            contribution = await self.db.get_clan_member_contribution(
                user['clan_id'], user_id
            )
            await self.check_clan_badges(user_id, contribution)
    
    async def check_streak_badges(self, user_id: str, streak: int):
        """Check and award streak-based badges"""
        streak_thresholds = [1, 7, 30, 100, 365]
        
        for threshold in streak_thresholds:
            if streak >= threshold:
                await self._award_badge_by_requirement(
                    user_id, 'streak', threshold
                )
    
    async def check_completion_badges(self, user_id: str, total_completions: int):
        """Check and award completion-based badges"""
        completion_thresholds = [10, 50, 100]
        
        for threshold in completion_thresholds:
            if total_completions >= threshold:
                await self._award_badge_by_requirement(
                    user_id, 'completion', threshold
                )
    
    async def check_level_badges(self, user_id: str, level: int):
        """Check and award level-based badges"""
        level_thresholds = [5, 10, 20]
        
        for threshold in level_thresholds:
            if level >= threshold:
                await self._award_badge_by_requirement(
                    user_id, 'level', threshold
                )
    
    async def check_clan_badges(self, user_id: str, contribution: int):
        """Check and award clan contribution badges"""
        clan_thresholds = [500, 5000]
        
        for threshold in clan_thresholds:
            if contribution >= threshold:
                await self._award_badge_by_requirement(
                    user_id, 'clan', threshold
                )
    
    async def award_badge(self, user_id: str, badge_name: str) -> dict:
        """Award a specific badge by name"""
        badge = await self.db.get_badge_by_name(badge_name)
        if not badge:
            return {'success': False, 'message': 'Badge not found'}
        
        # Check if already earned
        has_badge = await self.db.user_has_badge(user_id, badge['id'])
        if has_badge:
            return {'success': False, 'message': 'Badge already earned'}
        
        # Award badge
        user_badge = await self.db.create_user_badge(user_id, badge['id'])
        
        # Track in PostHog
        posthog.capture(user_id, 'badge_earned', {
            'badge_name': badge_name,
            'badge_type': badge.get('badge_type'),
            'rarity': badge.get('rarity')
        })
        
        return {
            'success': True,
            'badge': badge,
            'user_badge': user_badge
        }
    
    async def _award_badge_by_requirement(self, user_id: str, badge_type: str, requirement: int):
        """Internal method to award badge by type and requirement"""
        badge = await self.db.get_badge_by_type_and_requirement(badge_type, requirement)
        if badge:
            await self.award_badge(user_id, badge['name'])
    
    async def get_user_badges(self, user_id: str) -> List[UserBadge]:
        """Get all badges earned by a user"""
        return await self.db.get_user_badges(user_id)
    
    async def get_badge_progress(self, user_id: str) -> dict:
        """Get user's progress towards all badges"""
        user = await self.db.get_user(user_id)
        habits = await self.db.get_user_habits(user_id)
        
        max_streak = max((h.get('streak', 0) for h in habits), default=0)
        total_completions = sum(h.get('total_completions', 0) for h in habits)
        
        progress = {
            'earned': await self.get_user_badges(user_id),
            'in_progress': [],
            'locked': []
        }
        
        all_badges = await self.db.get_all_badges()
        earned_badge_ids = [b['badge_id'] for b in progress['earned']]
        
        for badge in all_badges:
            if badge['id'] in earned_badge_ids:
                continue
            
            current_value = 0
            if badge['badge_type'] == 'streak':
                current_value = max_streak
            elif badge['badge_type'] == 'completion':
                current_value = total_completions
            elif badge['badge_type'] == 'level':
                current_value = user.get('level', 1)
            elif badge['badge_type'] == 'clan' and user.get('clan_id'):
                current_value = await self.db.get_clan_member_contribution(
                    user['clan_id'], user_id
                )
            
            badge_info = {
                **badge,
                'progress': current_value,
                'requirement': badge['requirement'],
                'progress_percentage': min(100, (current_value / badge['requirement']) * 100)
            }
            
            if current_value >= badge['requirement'] * 0.5:
                progress['in_progress'].append(badge_info)
            else:
                progress['locked'].append(badge_info)
        
        return progress
