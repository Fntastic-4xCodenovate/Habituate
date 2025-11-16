# Leveling System Documentation

## Overview
The Habituate leveling system provides a robust XP-to-level progression with custom thresholds and automatic level calculation.

## Location
- **Service**: `/backend/services/leveling.py`
- **Integration**: Used by `xp_service.py`, `profile.py`, and other XP-awarding features

## Core Functions

### `level_from_xp(xp: int) -> int`
Calculate the current level based on total XP.

```python
from services.leveling import level_from_xp

level = level_from_xp(5000)  # Returns 9
```

### `progress_from_xp(xp: int) -> dict`
Get detailed progress information for the current level.

```python
from services.leveling import progress_from_xp

progress = progress_from_xp(5000)
# Returns:
# {
#   "current_level": 9,
#   "next_level": 10,
#   "current_xp": 5000,
#   "xp_into_level": 200,
#   "xp_for_next_level": 1200,
#   "progress_percentage": 14.29
# }
```

### `check_level_up(old_xp: int, new_xp: int) -> dict`
Detect if leveling up occurred when XP changes.

```python
from services.leveling import check_level_up

result = check_level_up(500, 2000)
# Returns:
# {
#   "leveled_up": True,
#   "old_level": 3,
#   "new_level": 6,
#   "levels_gained": 3,
#   "levels_crossed": [4, 5, 6]
# }
```

### `get_level_rewards(level: int) -> dict`
Get rewards for reaching a specific level.

```python
from services.leveling import get_level_rewards

rewards = get_level_rewards(10)
# Returns milestone rewards, titles, badges, unlocks
```

## XP Thresholds

| Level | XP Required | XP to Next | Progression Phase |
|-------|-------------|------------|-------------------|
| 1     | 0           | 200        | Early game        |
| 2     | 200         | 200        | Early game        |
| 3     | 400         | 400        | Early game        |
| 4     | 800         | 400        | Early game        |
| 5     | 1,200       | 600        | Early game        |
| 6     | 1,800       | 800        | Mid game          |
| 7     | 2,600       | 1,000      | Mid game          |
| 8     | 3,600       | 1,200      | Mid game          |
| 9     | 4,800       | 1,400      | Mid game          |
| 10    | 6,200       | 1,800      | Mid game          |
| 11    | 8,000       | 2,000      | **Soft bump**     |
| 12    | 10,000      | 2,500      | Late game         |
| 13    | 12,500      | 2,500      | Late game         |
| 14    | 15,000      | 3,000      | Late game         |
| 15    | 18,000      | 4,000      | Late game         |
| 16    | 22,000      | 5,000      | End game          |
| 17    | 27,000      | 6,000      | End game          |
| 18    | 33,000      | 7,000      | End game          |
| 19    | 40,000      | 10,000     | End game          |
| 20    | 50,000      | MAX        | **Max level**     |

## Integration Examples

### In Profile Routes
```python
from services.leveling import level_from_xp, progress_from_xp

@router.get("/profile/{user_id}")
async def get_profile(user_id: str):
    user = await db.get_user(user_id)
    
    # Auto-correct level if XP was manually changed
    computed_level = level_from_xp(user['xp'])
    if user['level'] != computed_level:
        await db.update_user(user_id, {'level': computed_level})
        user['level'] = computed_level
    
    return user
```

### In XP Service
```python
from services.leveling import level_from_xp, check_level_up

async def award_xp(user_id: str, amount: int):
    user = await db.get_user(user_id)
    old_xp = user['xp']
    new_xp = old_xp + amount
    
    # Detect level ups
    level_info = check_level_up(old_xp, new_xp)
    
    await db.update_user(user_id, {
        'xp': new_xp,
        'level': level_from_xp(new_xp)
    })
    
    if level_info['leveled_up']:
        # Trigger level-up rewards, notifications, etc.
        await handle_level_up(user_id, level_info)
```

### In Habit Completion
```python
from services.leveling import level_from_xp

async def complete_habit(user_id: str, habit_id: str):
    xp_earned = calculate_habit_xp(habit_id)
    
    # Award XP (which auto-updates level)
    await xp_service.award_xp(user_id, xp_earned, "habit_completion")
```

## API Endpoints

### Get Profile (Auto-syncs level)
```bash
GET /profile/{clerk_user_id}
```

### Get Level Progress
```bash
GET /profile/{clerk_user_id}/level-progress

Response:
{
  "current_level": 9,
  "next_level": 10,
  "current_xp": 5000,
  "xp_into_level": 200,
  "xp_for_next_level": 1200,
  "xp_required_for_level": 1400,
  "progress_percentage": 14.29
}
```

### Update Profile (Auto-calculates level)
```bash
PUT /profile/{clerk_user_id}
Content-Type: application/json

{
  "xp": 5000
}

# Level is automatically set to 9
```

## Testing

Run the test suite:
```bash
cd backend
python test_leveling_system.py
```

## Design Decisions

### Why Custom Thresholds?
- **Early game**: Quick progression (200-600 XP gaps) to hook new users
- **Mid game**: Moderate scaling (800-1800 XP) for steady engagement
- **Late game**: Steeper curve (2000-10000 XP) for long-term retention
- **Level 11 soft bump**: Creates a clear milestone between casual and committed players

### Auto-Sync on Read
The system automatically corrects `level` based on `xp` when reading profiles. This handles:
- Manual XP adjustments by admins
- Database inconsistencies
- Migration issues
- Edge cases

### Single Source of Truth
All leveling logic lives in `services/leveling.py`. No calculations elsewhere prevents:
- Drift between frontend/backend
- Inconsistent level displays
- Hard-to-maintain duplicate logic

## Future Enhancements

### Planned Features
- [ ] Prestige system (reset to L1 with bonuses after L20)
- [ ] Season-based XP multipliers
- [ ] Dynamic difficulty adjustment
- [ ] Level-based matchmaking for challenges
- [ ] XP decay for inactive users (optional)

### Database Trigger (Optional)
For absolute consistency, add a PostgreSQL trigger:
```sql
CREATE FUNCTION sync_user_level() RETURNS TRIGGER AS $$
BEGIN
  NEW.level := (
    SELECT COUNT(*) FROM unnest(ARRAY[0,200,400,800,1200,1800,2600,3600,4800,6200,8000,10000,12500,15000,18000,22000,27000,33000,40000,50000]) AS threshold
    WHERE NEW.xp >= threshold
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_level
BEFORE INSERT OR UPDATE OF xp ON user_profiles
FOR EACH ROW EXECUTE FUNCTION sync_user_level();
```

## Troubleshooting

### Level not updating?
1. Check that XP is being updated correctly
2. Verify `leveling.py` is imported properly
3. Ensure backend server restarted after changes
4. Check database for correct XP value

### Level shows wrong value?
- GET the profile endpoint - it auto-corrects
- Run: `python test_leveling_system.py` to verify calculations
- Check for stale frontend cache

### Need to manually fix levels?
```sql
UPDATE user_profiles 
SET level = (
  SELECT COUNT(*) FROM unnest(ARRAY[0,200,400,800,1200,1800,2600,3600,4800,6200,8000,10000,12500,15000,18000,22000,27000,33000,40000,50000]) AS t
  WHERE xp >= t
);
```
