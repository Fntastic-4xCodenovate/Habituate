"""Test script to verify the leveling system"""
from models.user import calculate_level_from_xp, get_xp_for_next_level, LEVEL_XP_THRESHOLDS

def test_leveling_system():
    """Test the leveling system with various XP amounts"""
    print("🎮 Testing Leveling System\n")
    print("=" * 60)
    
    # Test cases
    test_xp_values = [0, 100, 200, 500, 800, 1500, 3000, 6000, 10000, 15000, 25000, 40000, 50000, 60000]
    
    for xp in test_xp_values:
        level = calculate_level_from_xp(xp)
        progress = get_xp_for_next_level(xp)
        
        print(f"\n📊 XP: {xp:,}")
        print(f"   Level: {progress['current_level']} → {progress['next_level']}")
        print(f"   Progress: {progress['xp_into_level']}/{progress['xp_required_for_level']} XP ({progress['progress_percentage']}%)")
        print(f"   XP needed for next level: {progress['xp_needed_for_next']:,}")
    
    print("\n" + "=" * 60)
    print("\n✅ Level Thresholds:")
    for level, xp in sorted(LEVEL_XP_THRESHOLDS.items()):
        print(f"   Level {level:2d} → {xp:,} XP")
    
    print("\n" + "=" * 60)
    print("\n🎯 Specific Test Cases:")
    
    # Test exact level thresholds
    test_cases = [
        (199, 1, "Just before level 2"),
        (200, 2, "Exactly level 2"),
        (201, 2, "Just after level 2"),
        (1199, 4, "Just before level 5"),
        (1200, 5, "Exactly level 5"),
        (6200, 10, "Exactly level 10"),
        (8000, 11, "Exactly level 11 (soft difficulty bump)"),
        (50000, 20, "Exactly level 20 (max defined level)"),
    ]
    
    for xp, expected_level, description in test_cases:
        actual_level = calculate_level_from_xp(xp)
        status = "✅" if actual_level == expected_level else "❌"
        print(f"   {status} {description}: {xp:,} XP → Level {actual_level} (expected {expected_level})")

if __name__ == "__main__":
    test_leveling_system()
