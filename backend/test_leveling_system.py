#!/usr/bin/env python3
"""
Test script for the leveling system
Demonstrates all leveling functions and XP calculations
"""

from services.leveling import (
    level_from_xp,
    xp_for_level,
    next_level_threshold,
    progress_from_xp,
    check_level_up,
    get_level_rewards,
    LEVEL_THRESHOLDS
)


def test_level_calculations():
    """Test basic level calculations"""
    print("=" * 60)
    print("LEVEL CALCULATION TESTS")
    print("=" * 60)
    
    test_xp_values = [0, 100, 200, 500, 1000, 5000, 10000, 25000, 50000, 100000]
    
    for xp in test_xp_values:
        level = level_from_xp(xp)
        print(f"XP: {xp:6d} → Level: {level:2d}")
    print()


def test_progress_tracking():
    """Test level progress calculations"""
    print("=" * 60)
    print("LEVEL PROGRESS TESTS")
    print("=" * 60)
    
    test_cases = [
        ("Early game", 150),
        ("Mid level", 1500),
        ("Late game", 25000),
        ("Max level", 50000),
    ]
    
    for name, xp in test_cases:
        progress = progress_from_xp(xp)
        print(f"\n{name} ({xp} XP):")
        print(f"  Level: {progress['current_level']} → {progress['next_level']}")
        print(f"  Progress: {progress['xp_into_level']}/{progress['xp_required_for_level']} XP")
        print(f"  {progress['progress_percentage']}% complete")
        print(f"  Need {progress['xp_for_next_level']} more XP to level up")
    print()


def test_level_ups():
    """Test level-up detection"""
    print("=" * 60)
    print("LEVEL-UP DETECTION TESTS")
    print("=" * 60)
    
    test_cases = [
        ("Small gain (no level)", 100, 150),
        ("Single level up", 100, 250),
        ("Multiple levels", 500, 2000),
        ("Huge jump", 1000, 10000),
    ]
    
    for name, old_xp, new_xp in test_cases:
        result = check_level_up(old_xp, new_xp)
        print(f"\n{name}:")
        print(f"  {old_xp} XP → {new_xp} XP")
        print(f"  Level {result['old_level']} → {result['new_level']}")
        if result['leveled_up']:
            print(f"  🎉 Gained {result['levels_gained']} level(s)!")
            print(f"  Crossed levels: {result['levels_crossed']}")
        else:
            print(f"  No level up")
    print()


def test_rewards():
    """Test level reward system"""
    print("=" * 60)
    print("LEVEL REWARDS TESTS")
    print("=" * 60)
    
    milestone_levels = [5, 10, 15, 20]
    
    for level in milestone_levels:
        rewards = get_level_rewards(level)
        print(f"\nLevel {level} Rewards:")
        if rewards['xp_bonus']:
            print(f"  💎 XP Bonus: +{rewards['xp_bonus']}")
        if rewards['title']:
            print(f"  👑 Title: {rewards['title']}")
        if rewards['badge']:
            print(f"  🏆 Badge: {rewards['badge']}")
        if rewards['unlocks']:
            print(f"  🔓 Unlocks:")
            for unlock in rewards['unlocks']:
                print(f"     - {unlock}")
    print()


def test_threshold_lookup():
    """Test threshold lookups"""
    print("=" * 60)
    print("THRESHOLD LOOKUP TESTS")
    print("=" * 60)
    
    print("\nAll Level Thresholds:")
    for level in range(1, 21):
        threshold = xp_for_level(level)
        next_thresh = next_level_threshold(level)
        gap = next_thresh - threshold if next_thresh else 0
        print(f"  Level {level:2d}: {threshold:6d} XP", end="")
        if next_thresh:
            print(f" (need {gap:5d} more for L{level+1})")
        else:
            print(f" (MAX LEVEL)")
    print()


def test_edge_cases():
    """Test edge cases and boundaries"""
    print("=" * 60)
    print("EDGE CASE TESTS")
    print("=" * 60)
    
    edge_cases = [
        ("Negative XP", -100),
        ("Zero XP", 0),
        ("Exact threshold (L2)", 200),
        ("One below threshold", 199),
        ("One above threshold", 201),
        ("Beyond max level", 100000),
    ]
    
    for name, xp in edge_cases:
        level = level_from_xp(xp)
        print(f"{name:25s}: XP={xp:7d} → Level {level}")
    print()


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 15 + "HABITUATE LEVELING SYSTEM" + " " * 17 + "║")
    print("║" + " " * 20 + "Test Suite" + " " * 28 + "║")
    print("╚" + "═" * 58 + "╝")
    print("\n")
    
    test_level_calculations()
    test_progress_tracking()
    test_level_ups()
    test_rewards()
    test_threshold_lookup()
    test_edge_cases()
    
    print("=" * 60)
    print("✅ ALL TESTS COMPLETED")
    print("=" * 60)
    print()


if __name__ == "__main__":
    main()
