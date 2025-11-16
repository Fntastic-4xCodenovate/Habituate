-- Create function to safely increment user XP
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION increment_user_xp(user_profile_id UUID, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    xp = xp + xp_amount,
    total_points = COALESCE(total_points, 0) + xp_amount,
    level = CASE 
      WHEN (xp + xp_amount) >= 1000 THEN FLOOR((xp + xp_amount) / 1000) + 1
      ELSE level
    END
  WHERE id = user_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT 'XP increment function created successfully!' as message;