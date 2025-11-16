#!/bin/bash
# Test script to verify dynamic leveling across all frontend pages

echo "=================================="
echo "🧪 Testing Dynamic Leveling System"
echo "=================================="
echo ""

CLERK_USER_ID="user_35Tw5P9tVJY8ajvti0DHqugAI6y"
API_URL="http://localhost:8000"

echo "📊 Current Profile State:"
echo "-------------------------"
curl -s -X GET "$API_URL/profile/$CLERK_USER_ID" | jq -r '"Level: \(.level) | XP: \(.xp)"'
echo ""

echo "🎯 Test 1: Update XP to 5000 (should be Level 9)"
echo "-------------------------"
curl -s -X PUT "$API_URL/profile/$CLERK_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"xp": 5000}' | jq -r '"Level: \(.level) | XP: \(.xp)"'

echo ""
echo "📈 Level Progress:"
curl -s -X GET "$API_URL/profile/$CLERK_USER_ID/level-progress" | jq '.'
echo ""

echo "🎯 Test 2: Update XP to 15500 (should be Level 14)"
echo "-------------------------"
curl -s -X PUT "$API_URL/profile/$CLERK_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"xp": 15500}' | jq -r '"Level: \(.level) | XP: \(.xp)"'

echo ""
echo "📈 Level Progress:"
curl -s -X GET "$API_URL/profile/$CLERK_USER_ID/level-progress" | jq '.'
echo ""

echo "🎯 Test 3: Update XP to 50000 (should be Level 20 - MAX)"
echo "-------------------------"
curl -s -X PUT "$API_URL/profile/$CLERK_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"xp": 50000}' | jq -r '"Level: \(.level) | XP: \(.xp)"'

echo ""
echo "📈 Level Progress:"
curl -s -X GET "$API_URL/profile/$CLERK_USER_ID/level-progress" | jq '.'
echo ""

echo "🎯 Test 4: Get Profile Stats (should reflect latest level)"
echo "-------------------------"
curl -s -X GET "$API_URL/profile/$CLERK_USER_ID/stats" | jq '.'
echo ""

echo "🎯 Test 5: Get Full Profile (should auto-sync level)"
echo "-------------------------"
curl -s -X GET "$API_URL/profile/$CLERK_USER_ID" | jq '{level, xp, total_points}'
echo ""

echo "=================================="
echo "✅ All Tests Complete!"
echo "=================================="
echo ""
echo "📝 Pages that should show updated level:"
echo "  - Navbar (Lv badge)"
echo "  - Profile Page (level card + stats)"
echo "  - Settings Page (level stat card)"
echo "  - Dashboard (indirectly through user stats)"
echo ""
echo "🔄 Refresh your frontend pages to see the updated level!"
echo ""
