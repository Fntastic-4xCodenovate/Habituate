"""
Leveling system for Habituate
Handles XP to level calculations with custom thresholds
"""

LEVEL_THRESHOLDS = [
    0,      # L1
    200,    # L2
    400,    # L3
    800,    # L4
    1200,   # L5
    1800,   # L6
    2600,   # L7
    3600,   # L8
    4800,   # L9
    6200,   # L10
    # Soft bump
    8000,   # L11
    10000,  # L12
    12500,  # L13
    15000,  # L14
    18000,  # L15
    # Late-game
    22000,  # L16
    27000,  # L17
    33000,  # L18
    40000,  # L19
    50000,  # L20
]


def level_from_xp(xp: int) -> int:
    """Calculate level from total XP"""
    xp = max(0, int(xp or 0))
    level = 1
    for i, thresh in enumerate(LEVEL_THRESHOLDS, start=1):
        if xp >= thresh:
            level = i
    return level


def xp_for_level(level: int) -> int:
    """Get XP threshold for a specific level"""
    if level < 1:
        return 0
    if level > len(LEVEL_THRESHOLDS):
        return LEVEL_THRESHOLDS[-1]
    return LEVEL_THRESHOLDS[level - 1]


def next_level_threshold(level: int) -> int | None:
    """Get XP needed for next level"""
    if level >= len(LEVEL_THRESHOLDS):
        return None
    return LEVEL_THRESHOLDS[level]  # 1-indexed levels


def progress_from_xp(xp: int) -> dict:
    """Get detailed level progress information"""
    lvl = level_from_xp(xp)
    cur_thresh = LEVEL_THRESHOLDS[lvl - 1]
    nxt = next_level_threshold(lvl)
    into = xp - cur_thresh
    need = (nxt - cur_thresh) if nxt is not None else 0
    pct = (into / need * 100) if nxt is not None and need > 0 else 100
    
    return {
        "current_level": lvl,
        "next_level": lvl + 1 if nxt is not None else lvl,
        "current_xp": xp,
        "current_threshold": cur_thresh,
        "next_threshold": nxt,
        "xp_into_level": max(0, into),
        "xp_for_next_level": max(0, need - into) if nxt is not None else 0,
        "xp_required_for_level": need,
        "progress_percentage": round(pct, 2),
    }


def check_level_up(old_xp: int, new_xp: int) -> dict:
    """Check if leveling up occurred and return details"""
    old_level = level_from_xp(old_xp)
    new_level = level_from_xp(new_xp)
    
    leveled_up = new_level > old_level
    levels_gained = new_level - old_level if leveled_up else 0
    
    # Get all levels crossed
    levels_crossed = []
    if leveled_up:
        for level in range(old_level + 1, new_level + 1):
            levels_crossed.append(level)
    
    return {
        "leveled_up": leveled_up,
        "old_level": old_level,
        "new_level": new_level,
        "levels_gained": levels_gained,
        "levels_crossed": levels_crossed,
    }


def get_level_rewards(level: int) -> dict:
    """Get rewards for reaching a specific level"""
    rewards = {
        "xp_bonus": 0,
        "title": None,
        "badge": None,
        "unlocks": []
    }
    
    # Milestone rewards (every 5 levels)
    if level % 5 == 0:
        rewards["xp_bonus"] = level * 10
        rewards["badge"] = f"Level {level} Master"
    
    # Special milestones
    if level == 10:
        rewards["title"] = "Apprentice"
        rewards["unlocks"].append("Custom avatar frames")
    elif level == 15:
        rewards["title"] = "Journeyman"
        rewards["unlocks"].append("Special emotes")
    elif level == 20:
        rewards["title"] = "Master"
        rewards["unlocks"].append("Elite clan features")
    
    return rewards
