from typing import Optional
from datetime import datetime, date, timedelta
from services.database import Database
from services.xp_service import XPService
import posthog

class StreakService:
    def __init__(self):
        self.db = Database()
        self.xp_service = XPService()
    
    async def complete_habit(self, user_id: str, habit_id: str, notes: Optional[str] = None) -> dict:
        """Complete a habit and update streak"""
        habit = await self.db.get_habit(habit_id)
        today = date.today()
        
        # Check if already completed today
        last_completion = await self.db.get_last_completion(habit_id, user_id)
        if last_completion and last_completion['completed_at'].date() == today:
            return {
                'success': False,
                'message': 'Habit already completed today',
                'habit': habit
            }
        
        # Calculate new streak
        last_completed_date = habit.get('last_completed')
        if last_completed_date:
            last_date = last_completed_date.date() if isinstance(last_completed_date, datetime) else last_completed_date
            days_diff = (today - last_date).days
            
            if days_diff == 1:
                # Consecutive day
                new_streak = habit['streak'] + 1
            elif days_diff == 0:
                # Same day (shouldn't happen due to check above)
                new_streak = habit['streak']
            else:
                # Streak broken, start over
                new_streak = 1
        else:
            # First completion
            new_streak = 1
        
        # Update best streak
        best_streak = max(habit.get('best_streak', 0), new_streak)
        
        # Calculate XP
        xp_earned = await self.xp_service.calculate_habit_xp(
            habit.get('difficulty', 'medium'),
            new_streak
        )
        
        # Log completion
        completion = await self.db.create_habit_completion(
            habit_id=habit_id,
            user_id=user_id,
            xp_earned=xp_earned,
            notes=notes
        )
        
        # Update habit
        await self.db.update_habit(habit_id, {
            'streak': new_streak,
            'best_streak': best_streak,
            'total_completions': habit.get('total_completions', 0) + 1,
            'last_completed': datetime.now()
        })
        
        # Award XP
        xp_result = await self.xp_service.award_xp(
            user_id,
            xp_earned,
            f'habit_complete_{habit["title"]}'
        )
        
        # Check for streak bonuses
        streak_bonus = await self.xp_service.award_streak_bonus(user_id, new_streak)
        
        # Track in PostHog
        posthog.capture(user_id, 'habit_completed', {
            'habit_id': habit_id,
            'streak': new_streak,
            'xp_earned': xp_earned,
            'difficulty': habit.get('difficulty')
        })
        
        return {
            'habit_id': habit_id,
            'new_streak': new_streak,
            'best_streak': best_streak,
            'xp_earned': xp_earned
        }
    
    async def check_missed_days(self, user_id: str) -> list:
        """Check for missed habit completions"""
        habits = await self.db.get_user_habits(user_id)
        today = date.today()
        missed = []
        
        for habit in habits:
            if habit.get('last_completed'):
                last_date = habit['last_completed'].date()
                days_diff = (today - last_date).days
                
                # If missed yesterday
                if days_diff >= 2:
                    missed.append({
                        'habit_id': habit['id'],
                        'habit_title': habit['title'],
                        'last_completed': last_date,
                        'days_missed': days_diff - 1,
                        'current_streak': habit.get('streak', 0)
                    })
        
        return missed
    
    async def get_streak_stats(self, user_id: str) -> dict:
        """Get comprehensive streak statistics for a user"""
        habits = await self.db.get_user_habits(user_id)
        
        total_streaks = sum(h.get('streak', 0) for h in habits)
        active_habits = len([h for h in habits if h.get('streak', 0) > 0])
        longest_streak = max((h.get('best_streak', 0) for h in habits), default=0)
        
        return {
            'total_active_streaks': total_streaks,
            'active_habits': active_habits,
            'longest_streak': longest_streak,
            'habits': habits
        }
