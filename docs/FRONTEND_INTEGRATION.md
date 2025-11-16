# Frontend-Backend Integration Guide

## ✅ What's Been Completed

### 1. Backend API Client (`lib/api.ts`)
- Complete TypeScript client for all backend endpoints
- Type-safe interfaces matching backend models
- Error handling with APIError class
- Organized into modules:
  - `authAPI`: User registration and authentication
  - `habitsAPI`: Habit CRUD, completion, extra life redemption
  - `profileAPI`: User stats and activity tracking
  - `badgesAPI`: Badge collection and progress
  - `leaderboardAPI`: User and clan rankings
  - `questsAPI`: Daily/weekly quests
  - `discoverAPI`: Browse and adopt habit templates

### 2. Socket.IO Manager (`lib/socket.ts`)
- Real-time WebSocket connection management
- Singleton pattern for global socket instance
- Event handlers for:
  - Clan chat messages
  - XP updates and level-ups
  - Badge earned notifications
  - Streak milestones
  - Extra life rewards

### 3. User Synchronization
- `hooks/useBackendUser.ts`: Auto-register Clerk users with backend
- `components/BackendInitializer.tsx`: Global user sync wrapper
- Automatic Socket.IO connection on login

### 4. Updated Habits Page
- Connected to backend API instead of direct Supabase
- Real-time XP notifications on habit completion
- Level-up celebrations
- Badge earned alerts
- Difficulty selector (easy/medium/hard) with XP multipliers
- Error handling with user feedback

### 5. Enhanced Navbar
- Displays user level and XP in real-time
- Shows 3 most recent badges with icons
- Responsive design with mobile menu
- Auto-refreshes when user stats change

## 🚀 How to Use

### Creating a New Habit
```typescript
import { habitsAPI } from '@/lib/api';

const newHabit = await habitsAPI.create({
  user_id: userId,
  title: 'Morning Exercise',
  description: '30 minutes of cardio',
  difficulty: 'medium', // easy: 10 XP, medium: 25 XP, hard: 50 XP
  frequency: 'daily',
});
```

### Completing a Habit
```typescript
const result = await habitsAPI.complete(habitId, userId);

console.log(`+${result.xp_earned} XP earned!`);
if (result.level_up) {
  console.log(`Level up! Now level ${result.new_level}`);
}
if (result.badges_earned.length > 0) {
  console.log(`New badges: ${result.badges_earned.map(b => b.name).join(', ')}`);
}
```

### Using Extra Life (Streak Recovery)
```typescript
const result = await habitsAPI.useExtraLife(habitId, userId, '2024-01-15');

console.log(`Extra lives remaining: ${result.extra_lives_remaining}`);
console.log(`Streak preserved: ${result.habit.streak}`);
```

### Listening to Real-Time Events
```typescript
import { socketManager } from '@/lib/socket';

// Connect (automatically done in BackendInitializer)
socketManager.connect(userId);

// Listen for XP updates
socketManager.onXPUpdate((data) => {
  console.log(`+${data.xp_earned} XP! Total: ${data.new_total_xp}`);
  if (data.level_up) {
    showNotification(`Level Up! You're now level ${data.new_level}!`);
  }
});

// Listen for badge awards
socketManager.onBadgeEarned((data) => {
  showNotification(`🏆 New badge: ${data.badge_name}!`);
});

// Listen for streak milestones
socketManager.onStreakMilestone((data) => {
  showNotification(`🔥 ${data.streak}-day streak on ${data.habit_title}!`);
});
```

## 📊 Available Data

### User Stats
```typescript
const stats = await profileAPI.getStats(userId);
// Returns: user, total_habits, active_habits, completed_today, 
//          total_completions, xp_to_next_level, badges_earned
```

### Badges
```typescript
const badges = await badgesAPI.getUserBadges(userId);
// Returns: Array of { badge, earned_at, progress }

const progress = await badgesAPI.getBadgeProgress(userId);
// Returns: Array of { badge, progress, earned } for all badges
```

### Leaderboard
```typescript
const topUsers = await leaderboardAPI.getUsers(10);
// Returns: Top 10 users with { rank, xp, level }

const topClans = await leaderboardAPI.getClans(10);
// Returns: Top 10 clans with { rank, total_xp, level, member_count }
```

## 🎮 Gamification Features

### XP System
- **Easy habits**: 10 XP base
- **Medium habits**: 25 XP base
- **Hard habits**: 50 XP base
- **Streak bonuses**: 5% per consecutive day (max 50%)
- **Level-up formula**: XP needed = 100 × (1.5^(level-1))

### Extra Lives
- **Earn**: Complete 100-day streak on any habit
- **Use**: Redeem to restore a broken streak
- **Limit**: One extra life per habit per missed day
- **Backend tracks**: `used_extra_life` flag and `extra_life_date`

### Badges (16 total)
- **Streak**: 7, 30, 100, 365, 1000 days
- **Completion**: 10, 100, 1000 completions
- **Level**: 5, 10, 20
- **Social**: Joined clan
- **Clan**: Contributed XP, clan level 10
- **Special**: Extra life earned, quest master

## 🔧 Environment Variables Required

Ensure these are in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## ⚠️ Important Notes

1. **Backend must be running**: `python -m uvicorn main:socket_app --reload` in `backend/` directory
2. **Database schema**: Run `supabase/enhanced_schema.sql` in Supabase SQL Editor before using gamification features
3. **User registration**: Happens automatically on first login via `BackendInitializer`
4. **Error handling**: All API calls wrapped in try-catch, show user-friendly notifications
5. **Socket.IO**: Auto-connects/disconnects based on auth state

## 🐛 Troubleshooting

### "Failed to load habits"
- Check backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for API errors

### "User not found" error
- Backend will auto-register on first API call
- Check Clerk user ID matches backend user record

### Badges not showing in navbar
- Ensure database migration ran (badges table exists)
- Check backend `/badges/{user_id}` endpoint returns data
- Verify `badgesAPI.getUserBadges()` doesn't throw errors

### Socket.IO not connecting
- Verify `NEXT_PUBLIC_WS_URL` in `.env.local`
- Check browser console for WebSocket connection messages
- Ensure backend Socket.IO is configured with CORS for frontend URL

## 📝 Next Steps

To complete the integration:

1. **Run Database Migration**:
   - Open Supabase SQL Editor
   - Copy/paste contents of `backend/supabase/enhanced_schema.sql`
   - Execute to create all gamification tables

2. **Test Habit Creation**:
   - Go to `/habits` page
   - Create a new habit
   - Complete it and verify XP notification appears

3. **Check Navbar Badges**:
   - Complete 7 habits to earn "Week Warrior" badge
   - Verify badge icon appears in navbar

4. **Create Additional Pages** (Optional):
   - Clan page: `app/clans/[id]/page.tsx`
   - Discover page: `app/discover/page.tsx`
   - Badge showcase: `app/badges/page.tsx`

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Habits page loads without errors
- ✅ Creating a habit shows success notification
- ✅ Completing a habit shows "+XP earned!" notification
- ✅ Navbar displays your level and XP
- ✅ Browser console shows "✅ Socket connected"
- ✅ No CORS errors in network tab
