# HABITUATE Backend API

FastAPI backend for HABITUATE with Socket.IO, PostHog analytics, and comprehensive gamification features.

## 🎯 Features

### Core Systems
- **XP & Leveling**: Exponential level progression with XP rewards
- **Badges**: 16 predefined badges across 6 categories (streak, completion, level, social, clan, special)
- **Clans**: Team-based progression with clan XP and leaderboards
- **Extra Lives**: Awarded at 100-day streak, restore broken streaks
- **Quests**: Daily, weekly, and special quests with rewards
- **Habit Discovery**: Browse and adopt public habits

### Real-time Features
- **Socket.IO**: Real-time clan chat and notifications
- **WebSocket**: Live updates for XP gains, level ups, badge awards
- **Clan Chat**: Real-time messaging within clans

### Analytics
- **PostHog**: Track user events, XP gains, completions, level ups
- **User Stats**: Comprehensive statistics dashboard
- **Leaderboards**: User and clan rankings

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI app with Socket.IO
├── config.py               # Configuration settings
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
│
├── models/                 # Pydantic models
│   ├── user.py            # User, XP, Level models
│   ├── habit.py           # Habit, Completion models
│   ├── badge.py           # Badge definitions
│   ├── clan.py            # Clan models
│   └── quest.py           # Quest models
│
├── services/               # Business logic
│   ├── database.py        # Supabase client & queries
│   ├── xp_service.py      # XP calculation & rewards
│   ├── streak_service.py  # Streak tracking & extra lives
│   ├── badge_service.py   # Badge checking & awarding
│   └── websocket_manager.py # WebSocket connections
│
└── routes/                 # API endpoints
    ├── auth.py            # Authentication
    ├── habits.py          # Habit CRUD
    ├── profile.py         # User profiles
    ├── leaderboard.py     # Rankings
    ├── clans.py           # Clan management
    ├── badges.py          # Badge system
    ├── quests.py          # Quest system
    └── discover.py        # Habit discovery
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Supabase account
- PostHog account (optional)

### Installation

1. **Install dependencies**:
```powershell
cd backend
pip install -r requirements.txt
```

2. **Configure environment**:
```powershell
Copy-Item .env.example .env
```

Edit `.env` with your credentials:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# PostHog
POSTHOG_API_KEY=your_posthog_key

# Server
SECRET_KEY=your_secret_key
```

3. **Run database migrations**:
```sql
-- Run enhanced_schema.sql in Supabase SQL Editor
```

4. **Start the server**:
```powershell
python -m uvicorn main:socket_app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Socket.IO**: ws://localhost:8000

## 📊 XP & Leveling System

### XP Awards
| Action | XP |
|--------|-----|
| Habit Complete | 10 (base) × difficulty × (1 + streak_bonus) |
| Daily Streak | 5 |
| Weekly Streak (7 days) | 25 |
| Monthly Streak (30 days) | 100 |
| Century Streak (100 days) | 500 + Extra Life |
| Quest Complete | 50-200 |
| Badge Earned | 30 |
| Clan Contribution | 15 |

### Level Progression
- **Formula**: `XP_required = 100 × (1.5 ^ (level - 1))`
- **Level 1→2**: 100 XP
- **Level 2→3**: 150 XP
- **Level 5**: 506 XP
- **Level 10**: 3,834 XP
- **Level 20**: 437,894 XP

## 🏆 Badge System

### Categories
1. **Streak Badges** (5): 1, 7, 30, 100, 365 day streaks
2. **Completion Badges** (3): 10, 50, 100 completions
3. **Level Badges** (3): Level 5, 10, 20
4. **Social Badges** (1): Join a clan
5. **Clan Badges** (2): Contribute 500, 5000 XP
6. **Special Badges** (2): Phoenix (use extra life), Perfectionist

### Rarity
- **Common**: 🟢 Base achievements
- **Rare**: 🔵 Intermediate goals
- **Epic**: 🟣 Major milestones
- **Legendary**: 🟡 Ultimate achievements

## 💎 Extra Life System

### Earning Extra Lives
- **100-Day Streak**: Automatically awarded
- **Century Club Badge**: Unlocked simultaneously

### Using Extra Lives
```python
POST /api/habits/extra-life/use
{
  "user_id": "user_xxx",
  "habit_id": "habit_xxx",
  "date_to_restore": "2024-01-15"
}
```

### Logic
1. User misses a day → streak breaks
2. System detects missed completion
3. If `extra_lives > 0`, user can redeem
4. Redemption sets `used_extra_life = true`
5. Streak is preserved (not reset to 1)
6. Extra life count decrements

## 🏰 Clan System

### Features
- **Clan Creation**: Create with name, icon, description
- **Member Limit**: 50 members per clan
- **Clan XP**: Aggregate of all member contributions
- **Clan Chat**: Real-time messaging via Socket.IO
- **Leaderboard**: Rank by total XP

### Endpoints
```python
POST /api/clans/                     # Create clan
POST /api/clans/{clan_id}/join       # Join clan
GET  /api/clans/{clan_id}/members    # Get members
POST /api/clans/{clan_id}/messages   # Send message
GET  /api/clans/{clan_id}/stats      # Clan stats
```

## 🔌 Socket.IO Events

### Client → Server
```javascript
// Join clan room
socket.emit('join_clan_room', { clan_id: 'xxx' });

// Send message
socket.emit('clan_message', {
  clan_id: 'xxx',
  user_id: 'user_xxx',
  message: 'Hello clan!'
});
```

### Server → Client
```javascript
// New clan message
socket.on('new_clan_message', (data) => {
  // { user_id, message, timestamp }
});

// Member joined
socket.on('member_joined', (data) => {
  // { user_id, username }
});
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user from Clerk
- `GET /api/auth/me/{clerk_user_id}` - Get current user

### Habits
- `POST /api/habits/` - Create habit
- `GET /api/habits/user/{user_id}` - Get user habits
- `POST /api/habits/{habit_id}/complete` - Complete habit
- `GET /api/habits/missed-days/{user_id}` - Check missed days
- `POST /api/habits/extra-life/use` - Use extra life

### Profile
- `GET /api/profile/{user_id}` - Get profile
- `GET /api/profile/{user_id}/stats` - Get stats
- `PUT /api/profile/{user_id}` - Update profile

### Leaderboard
- `GET /api/leaderboard/users` - User leaderboard
- `GET /api/leaderboard/clans` - Clan leaderboard
- `GET /api/leaderboard/user/{user_id}/rank` - User rank

### Badges
- `GET /api/badges/user/{user_id}` - Get earned badges
- `GET /api/badges/user/{user_id}/progress` - Badge progress
- `POST /api/badges/check/{user_id}` - Check new badges

### Quests
- `GET /api/quests/active/{user_id}` - Active quests
- `GET /api/quests/daily` - Daily quests
- `GET /api/quests/weekly` - Weekly quests

### Discover
- `GET /api/discover/habits` - Browse public habits
- `GET /api/discover/popular` - Popular habits
- `POST /api/discover/habits/{habit_id}/adopt` - Adopt habit

## 📊 PostHog Events

All events are automatically tracked:

```python
# XP Events
'xp_awarded'           # { amount, reason, new_xp, new_level }
'level_up'             # { level }
'milestone_bonus'      # { level, bonus_xp }

# Habit Events
'habit_completed'      # { habit_id, streak, xp_earned, difficulty }
'extra_life_earned'    # { total_lives, reason }
'extra_life_used'      # { habit_id, date_restored, remaining_lives }

# Badge Events
'badge_earned'         # { badge_name, badge_type, rarity }
```

## 🔄 Integration with Next.js

### Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### API Client Example
```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function completeHabit(habitId: string, userId: string) {
  const response = await fetch(`${API_URL}/api/habits/${habitId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  return response.json();
}
```

### Socket.IO Client
```typescript
// lib/socket.ts
import io from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_WS_URL);

socket.on('connect', () => {
  console.log('Connected to backend');
});

socket.emit('join_clan_room', { clan_id: 'xxx' });

socket.on('new_clan_message', (data) => {
  // Handle new message
});
```

## 🧪 Testing

### Test API with curl
```powershell
# Health check
curl http://localhost:8000/health

# Get leaderboard
curl http://localhost:8000/api/leaderboard/users

# Complete habit
curl -X POST http://localhost:8000/api/habits/habit_id/complete `
  -H "Content-Type: application/json" `
  -d '{"user_id": "user_xxx"}'
```

### Interactive API Docs
Visit http://localhost:8000/docs for Swagger UI

## 🐛 Troubleshooting

### Connection Issues
- Ensure Supabase URL and keys are correct
- Check if port 8000 is available
- Verify firewall settings

### Database Errors
- Run `enhanced_schema.sql` in Supabase
- Check RLS policies are enabled
- Verify service role key has admin access

### Socket.IO Issues
- Check CORS settings in `main.py`
- Verify frontend URL matches `FRONTEND_URL`
- Test with Socket.IO tester tool

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Socket.IO Python Server](https://python-socketio.readthedocs.io/)
- [PostHog Python SDK](https://posthog.com/docs/libraries/python)
- [Supabase Python Client](https://supabase.com/docs/reference/python)

## 🤝 Contributing

1. Create a new branch for your feature
2. Make changes and test thoroughly
3. Update documentation
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details
