# 🎮 HABITUATE Gamification Quick Reference

## 🎯 XP System

### XP Awards
| Action | XP | Notes |
|--------|-----|-------|
| Complete Easy Habit | 10 | Base XP |
| Complete Medium Habit | 15 | 1.5× multiplier |
| Complete Hard Habit | 20 | 2× multiplier |
| 7-Day Streak | 25 | Weekly bonus |
| 30-Day Streak | 100 | Monthly bonus |
| 100-Day Streak | 500 | + Extra Life! |
| Complete Quest | 50-200 | Varies by quest |
| Earn Badge | 30 | All badges |
| Clan Contribution | 15 | Auto-added to clan |

### Streak Bonus
- **+5% per 10 days** (max 50%)
- Example: 50-day streak on hard habit = 20 × 1.5 × 1.25 = **37.5 XP**

### Level Progression
```
Level 1 → 2:    100 XP
Level 2 → 3:    150 XP
Level 3 → 4:    225 XP
Level 4 → 5:    338 XP
Level 5 → 6:    506 XP
Level 10:     3,834 XP (cumulative)
Level 20:   437,894 XP (cumulative)
```

## 🏅 Badge System

### Streak Badges (5)
- 🎯 **First Steps** (1 day) - Common - 10 XP
- 🔥 **Week Warrior** (7 days) - Common - 25 XP
- 💪 **Monthly Master** (30 days) - Rare - 100 XP
- 💎 **Century Club** (100 days) - Epic - 500 XP + Extra Life
- 👑 **Legendary Streak** (365 days) - Legendary - 1000 XP

### Completion Badges (3)
- ⭐ **Habit Starter** (10 completions) - Common - 20 XP
- 🌟 **Habit Builder** (50 completions) - Rare - 75 XP
- ✨ **Habit Master** (100 completions) - Epic - 200 XP

### Level Badges (3)
- 🥉 **Novice** (Level 5) - Common - 50 XP
- 🥈 **Expert** (Level 10) - Rare - 100 XP
- 🥇 **Elite** (Level 20) - Epic - 250 XP

### Social Badges (1)
- 🤝 **Team Player** (Join clan) - Common - 15 XP

### Clan Badges (2)
- 🏆 **Clan Contributor** (500 clan XP) - Rare - 100 XP
- 👑 **Clan Legend** (5000 clan XP) - Legendary - 500 XP

### Special Badges (2)
- 🔄 **Phoenix** (Use extra life) - Rare - 75 XP
- 💯 **Perfectionist** (30 perfect days) - Epic - 300 XP

## 💎 Extra Life System

### Earning
- **Automatic** at 100-day streak
- Century Club badge awarded simultaneously
- Shows notification: "🎉 Extra Life Earned!"

### Using
1. Miss a habit completion → streak breaks
2. System shows "Use Extra Life?" notification
3. Click "Use Extra Life 💎"
4. Streak restored, extra life count -1
5. Habit marked `used_extra_life = true`
6. Phoenix badge awarded (first use)

### Limitations
- **One per habit** until next completion
- Must be used on next completion after miss
- Cannot use retroactively beyond 1 day

## 🏰 Clan System

### Clan Features
| Feature | Limit | Notes |
|---------|-------|-------|
| Max Members | 50 | Per clan |
| XP Contribution | Auto | All your XP |
| Chat Messages | Unlimited | Real-time |
| Roles | 3 | Leader, Mod, Member |

### Clan Roles
- **Leader**: Create, manage, delete clan
- **Moderator**: Manage members, moderate chat
- **Member**: Contribute XP, participate

### Clan Leaderboard
Clans ranked by:
1. Total XP (sum of all members)
2. Member count (tiebreaker)
3. Created date (final tiebreaker)

## 🎯 Quest System

### Daily Quests (Reset 00:00 UTC)
- **Morning Momentum**: Complete 3 habits before noon - 50 XP
- **Perfect Day**: Complete all habits today - 75 XP
- **Streak Keeper**: Maintain all streaks - 30 XP

### Weekly Quests (Reset Monday 00:00 UTC)
- **Weekly Warrior**: Complete 20 habits - 200 XP
- **Clan Hero**: Contribute 500 XP to clan - 150 XP
- **Social Butterfly**: Send 10 clan messages - 100 XP

### Special Quests (Event-based)
- **Century Sprint**: Reach 100-day streak - 500 XP
- **Badge Hunter**: Earn 5 badges - 250 XP
- **Clan Champion**: Be top contributor - 300 XP

## 📊 Leaderboards

### User Leaderboard
Ranked by:
1. Total Points (XP + bonuses)
2. Level (tiebreaker)
3. Account age (final tiebreaker)

### Clan Leaderboard
Ranked by:
1. Total Clan XP
2. Member count
3. Clan age

## 🔔 Notification Types

### Real-time Notifications
- 🎉 **Level Up**: "You reached Level X!"
- 🏅 **Badge Earned**: "You earned the [Badge Name] badge!"
- 💎 **Extra Life**: "Extra life earned at 100-day streak!"
- 🏰 **Clan Activity**: "New member joined: [Username]"
- ✅ **Quest Complete**: "[Quest Name] completed! +X XP"
- 🔥 **Streak Alert**: "Don't lose your X-day streak!"

## 🌍 Habit Discovery

### Categories
- 💪 Health & Fitness
- 🧘 Mindfulness
- 📚 Learning
- ⚡ Productivity
- 👥 Social
- 🎨 Creative
- 💰 Finance
- ✨ Other

### Filtering
- By category
- By difficulty (easy, medium, hard)
- By popularity (adoption count)
- Search by keyword

## 📱 Frontend Integration Checklist

### Initial Setup
- [ ] Install `socket.io-client`

- [ ] Create `lib/api.ts` (API client)
- [ ] Create `lib/socket.ts` (Socket manager)


### Dashboard Enhancements
- [ ] Display current level + XP progress bar
- [ ] Show recent badges (5 latest)
- [ ] Extra life count display
- [ ] Missed days alert with "Use Life" button
- [ ] Quest progress tracker

### New Pages Needed
- [ ] `/clans/[id]` - Clan page with chat + stats
- [ ] `/discover` - Browse and adopt habits
- [ ] `/badges` - Badge collection showcase
- [ ] `/quests` - Active and completed quests

### Components to Create
- [ ] `XPProgressBar` - Visual XP progress
- [ ] `BadgeCard` - Display badge with rarity
- [ ] `ClanChat` - Real-time messaging
- [ ] `QuestCard` - Quest with progress
- [ ] `ExtraLifeButton` - Redeem extra life
- [ ] `NotificationToast` - Real-time alerts

## 🔧 Testing Endpoints

```powershell
# Health check
curl http://localhost:8000/health

# Complete habit (awards XP)
curl -X POST "http://localhost:8000/api/habits/HABIT_ID/complete?user_id=USER_ID"

# Check badges
curl http://localhost:8000/api/badges/user/USER_ID

# Get leaderboard
curl http://localhost:8000/api/leaderboard/users

# Check missed days
curl http://localhost:8000/api/habits/missed-days/USER_ID

# Use extra life
curl -X POST http://localhost:8000/api/habits/extra-life/use `
  -H "Content-Type: application/json" `
  -d '{"user_id":"USER_ID","habit_id":"HABIT_ID","date_to_restore":"2024-01-15"}'
```

## 🎨 UI Suggestions

### XP Gain Animation
```css
@keyframes xp-pop {
  0% { transform: scale(0) translateY(0); opacity: 0; }
  50% { transform: scale(1.2) translateY(-20px); opacity: 1; }
  100% { transform: scale(1) translateY(-40px); opacity: 0; }
}

.xp-gain {
  animation: xp-pop 1s ease-out;
  color: #FFD700; /* Gold */
  font-weight: bold;
  font-size: 1.5rem;
}
```

### Badge Unlock Animation
```css
@keyframes badge-unlock {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.badge-unlock {
  animation: badge-unlock 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Level Up Flash
```css
@keyframes level-up-flash {
  0%, 50%, 100% { background: transparent; }
  25%, 75% { background: rgba(255, 215, 0, 0.3); }
}

.level-up {
  animation: level-up-flash 1s;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
}
```

## 📊 Analytics Events

All automatically tracked:
- `xp_awarded` - { amount, reason, new_level }
- `level_up` - { level }
- `badge_earned` - { badge_name, rarity }
- `habit_completed` - { habit_id, streak, xp }
- `extra_life_earned` - { total_lives }
- `extra_life_used` - { habit_id, remaining }
- `clan_joined` - { clan_id, clan_name }
- `quest_completed` - { quest_id, xp_reward }

---

**Quick Start**: See `docs/BACKEND_INTEGRATION.md` for full setup guide!
