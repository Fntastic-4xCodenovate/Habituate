#!/usr/bin/env python3
"""
Test the level calculation logic
"""

from models.user import calculate_level_from_xp, calculate_xp_for_level, get_xp_progress

def test_level_calculation():
    """Test level calculation with various XP values"""
    print("🧪 Testing Level Calculation Logic")
    print("="*50)
    
    test_cases = [
        0, 50, 100, 150, 250, 400, 700, 1200, 2000, 5000
    ]
    
    print(f"{'XP':<8} | {'Level':<6} | {'XP for Level':<12} | {'Progress':<10}")
    print("-" * 50)
    
    for xp in test_cases:
        level = calculate_level_from_xp(xp)
        xp_for_level = calculate_xp_for_level(level)
        progress = get_xp_progress(xp)
        
        print(f"{xp:<8} | {level:<6} | {xp_for_level:<12} | {progress['progress_percentage']:.1f}%")
    
    print("\n📊 Detailed Progress Examples:")
    print("-" * 50)
    
    for xp in [150, 500, 1500]:
        progress = get_xp_progress(xp)
        print(f"\nXP: {xp}")
        print(f"  Level: {progress['current_level']}")
        print(f"  XP in current level: {progress['xp_in_current_level']}")
        print(f"  XP needed for next: {progress['xp_needed_for_next']}")
        print(f"  Progress: {progress['progress_percentage']:.1f}%")

if __name__ == "__main__":
    test_level_calculation()