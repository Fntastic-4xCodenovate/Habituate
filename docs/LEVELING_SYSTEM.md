# Leveling System Implementation

## Overview
The leveling system has been successfully integrated into Habituate with custom XP thresholds that create a smooth progression curve.

## Level Progression

### Early Game (Levels 1-10)
- **Level 1** → 0 XP (Starting point)
- **Level 2** → 200 XP
- **Level 3** → 400 XP
- **Level 4** → 800 XP
- **Level 5** → 1,200 XP
- **Level 6** → 1,800 XP
- **Level 7** → 2,600 XP
- **Level 8** → 3,600 XP
- **Level 9** → 4,800 XP
- **Level 10** → 6,200 XP

### Mid Game - Soft Difficulty Bump (Levels 11-15)
- **Level 11** → 8,000 XP
- **Level 12** → 10,000 XP
- **Level 13** → 12,500 XP
- **Level 14** → 15,000 XP
- **Level 15** → 18,000 XP

### Late Game - Mastery (Levels 16-20)
- **Level 16** → 22,000 XP
- **Level 17** → 27,000 XP
- **Level 18** → 33,000 XP
- **Level 19** → 40,000 XP
- **Level 20** → 50,000 XP

## Features

### Automatic Level Up
When a user gains XP, the system automatically:
1. Calculates their new level based on total XP
2. Detects if they've leveled up
3. Triggers level-up rewards and badges
4. Sends PostHog analytics events
5. Returns level progress information

### API Endpoints

#### Award XP (Existing - Enhanced)
```
POST /api/xp/award
```
**Response includes:**
```json
{
  "xp_awarded": 100,
  "total_xp": 1500,
  "old_level": 5,
  "new_level": 5,
  "level_ups": [],
  "reason": "habit_completion",
  "level_progress": {
    "current_level": 5,
    "next_level": 6,
    "current_xp": 1500,
    "xp_into_level": 300,
    "xp_needed_for_next": 300,
    "xp_required_for_level": 600,
    "progress_percentage": 50.0
  }
}
```

#### Get Level Progress (New)
```
GET /api/profile/{user_id}/level-progress
```
**Response:**
```json
{
  "current_level": 5,
  "next_level": 6,
  "current_xp": 1500,
  "xp_into_level": 300,
  "xp_needed_for_next": 300,
  "xp_required_for_level": 600,
  "progress_percentage": 50.0
}
```

### Core Functions

#### `calculate_level_from_xp(xp: int) -> int`
Calculates the current level based on total XP.

**Example:**
```python
level = calculate_level_from_xp(1500)  # Returns 5
```

#### `calculate_xp_for_level(level: int) -> int`
Returns the XP required to reach a specific level.

**Example:**
```python
xp_needed = calculate_xp_for_level(6)  # Returns 1800
```

#### `get_xp_for_next_level(current_xp: int) -> dict`
Returns detailed progress information including:
- Current level
- Next level
- XP progress into current level
- XP needed for next level
- Progress percentage

**Example:**
```python
progress = get_xp_for_next_level(1500)
# Returns:
# {
#   'current_level': 5,
#   'next_level': 6,
#   'current_xp': 1500,
#   'xp_into_level': 300,
#   'xp_needed_for_next': 300,
#   'xp_required_for_level': 600,
#   'progress_percentage': 50.0
# }
```

## XP Award Sources

Users can earn XP from various activities:

| Activity | XP Amount | Notes |
|----------|-----------|-------|
| Complete Habit | 10 (base) | Multiplied by difficulty & streak bonus |
| Daily Streak | 5 | Per day maintained |
| Weekly Streak | 25 | 7-day milestone |
| Monthly Streak | 100 | 30-day milestone |
| Complete Quest | 50 | Per quest |
| Earn Badge | 30 | Per badge |
| Clan Contribution | 15 | Helping clan members |
| Help Clan Member | 5 | Per assistance |

### Habit XP Calculation
The XP service calculates habit completion XP with:
- **Difficulty multiplier:**
  - Easy: 1.0x
  - Medium: 1.5x
  - Hard: 2.0x
- **Streak bonus:** 5% per 10 days (max 50%)

**Example:**
```python
# Hard habit with 20-day streak
base_xp = 10
difficulty = 2.0  # Hard
streak_bonus = 0.10  # 10% for 20 days
total_xp = 10 * 2.0 * 1.10 = 22 XP
```

## Level-Up Rewards

### Automatic Rewards
- **Every Level:** Badge checks, PostHog analytics
- **Milestone Levels (5, 10, 15, 20):** Bonus XP = level × 10

### Extra Lives
Users earn extra lives at:
- **100-day streak:** 1 extra life + Century Club badge + 500 XP

## Integration Examples

### Frontend Display
```typescript
// Fetch user level progress
const response = await fetch(`/api/profile/${userId}/level-progress`);
const progress = await response.json();

// Display progress bar
<ProgressBar 
  value={progress.xp_into_level} 
  max={progress.xp_required_for_level}
  percentage={progress.progress_percentage}
/>

// Display level info
<div>
  Level {progress.current_level}
  <span>{progress.xp_into_level}/{progress.xp_required_for_level} XP</span>
</div>
```

### Awarding XP
```typescript
// When user completes a habit
const result = await fetch('/api/xp/award', {
  method: 'POST',
  body: JSON.stringify({
    user_id: userId,
    xp_amount: 22,
    reason: 'hard_habit_completion'
  })
});

const data = await result.json();

if (data.level_ups.length > 0) {
  // Show level-up animation
  showLevelUpModal(data.level_ups);
}
```

## Database Schema

The user profile includes:
```python
{
  'xp': int,           # Total XP accumulated
  'level': int,        # Current level (auto-calculated)
  'total_points': int, # Lifetime points (includes XP)
  'extra_lives': int   # Extra lives earned
}
```

## Testing

Run the test script to verify the leveling system:
```bash
cd backend
python test_leveling.py
```

This will show:
- XP progression through various levels
- Exact level thresholds
- Level calculation accuracy

## Future Enhancements

Potential additions to the leveling system:
1. **Prestige System:** Reset to level 1 with permanent bonuses after level 20
2. **Season Levels:** Temporary levels that reset periodically
3. **Level-Based Unlocks:** New features unlocked at specific levels
4. **Leaderboard Integration:** Rank users by level + XP
5. **Level Titles:** "Novice", "Expert", "Master", etc.

## Files Modified

1. **`backend/models/user.py`**
   - Added `LEVEL_XP_THRESHOLDS` dictionary
   - Updated `calculate_level_from_xp()` function
   - Updated `calculate_xp_for_level()` function
   - Added `get_xp_for_next_level()` function

2. **`backend/services/xp_service.py`**
   - Enhanced `award_xp()` to return level progress
   - Imported `get_xp_for_next_level` function

3. **`backend/routes/profile.py`**
   - Added `/level-progress` endpoint

4. **`backend/test_leveling.py`** (New)
   - Comprehensive test suite for leveling system
