-- Insert default clans for users to join
-- Note: Run this after running the alter_clan_schema.sql

-- First, let's create some system/default clans that don't require a specific creator
-- We'll temporarily disable the trigger for these inserts

-- Disable trigger temporarily
DROP TRIGGER IF EXISTS trigger_auto_add_clan_creator ON clans;

-- Insert default clans
INSERT INTO clans (
    id, 
    name, 
    description, 
    avatar_url, 
    total_xp, 
    level, 
    max_members, 
    is_public, 
    banner_url,
    tags,
    join_code
) VALUES 
(
    gen_random_uuid(),
    'Shadow Warriors',
    'Elite fighters who thrive in adversity. We build unbreakable habits through discipline and mutual support. Join us to forge your legendary path.',
    NULL,
    45000,
    15,
    50,
    true,
    NULL,
    ARRAY['competitive', 'fitness', 'discipline'],
    'SHADOW'
),
(
    gen_random_uuid(),
    'Zen Masters',
    'Find inner peace through mindful habits. We focus on meditation, mindfulness, and balanced living. Perfect for those seeking harmony and growth.',
    NULL,
    32000,
    12,
    40,
    true,
    NULL,
    ARRAY['mindfulness', 'wellness', 'balance'],
    'ZENITH'
),
(
    gen_random_uuid(),
    'Code Crusaders',
    'Developers and tech enthusiasts building coding habits daily. LeetCode, side projects, and continuous learning are our mantras.',
    NULL,
    28000,
    10,
    60,
    true,
    NULL,
    ARRAY['coding', 'technology', 'learning'],
    'CODEX1'
),
(
    gen_random_uuid(),
    'Fitness Legends',
    'Gym warriors and fitness enthusiasts pushing physical boundaries. From beginners to pros, we support every fitness journey.',
    NULL,
    38000,
    14,
    45,
    true,
    NULL,
    ARRAY['fitness', 'health', 'strength'],
    'FITLEG'
),
(
    gen_random_uuid(),
    'Night Owls',
    'For those who work best after sunset. We build productive late-night routines and support each other through unconventional schedules.',
    NULL,
    22000,
    8,
    35,
    true,
    NULL,
    ARRAY['productivity', 'night', 'creativity'],
    'NOCTRL'
),
(
    gen_random_uuid(),
    'Early Birds',
    'Rise and shine champions who conquer the dawn. Morning routines, early workouts, and productivity before the world wakes up.',
    NULL,
    35000,
    13,
    40,
    true,
    NULL,
    ARRAY['morning', 'productivity', 'health'],
    'DAWN23'
),
(
    gen_random_uuid(),
    'Study Squad',
    'Students and lifelong learners building consistent study habits. From exam prep to skill development, we learn together.',
    NULL,
    26000,
    9,
    55,
    true,
    NULL,
    ARRAY['education', 'study', 'growth'],
    'STUDY9'
),
(
    gen_random_uuid(),
    'Creative Minds',
    'Artists, writers, and creators nurturing daily creative practices. Inspiration, feedback, and artistic growth in a supportive community.',
    NULL,
    30000,
    11,
    35,
    true,
    NULL,
    ARRAY['creativity', 'art', 'inspiration'],
    'CREATE'
),
(
    gen_random_uuid(),
    'Habit Rookies',
    'New to habit building? Start here! A welcoming space for beginners to learn the basics and build their first consistent routines.',
    NULL,
    15000,
    5,
    100,
    true,
    NULL,
    ARRAY['beginner', 'support', 'basics'],
    'ROOKIE'
),
(
    gen_random_uuid(),
    'Phoenix Rising',
    'For those making a comeback. Whether from setbacks, bad habits, or life challenges - we rise stronger together.',
    NULL,
    20000,
    7,
    30,
    true,
    NULL,
    ARRAY['recovery', 'resilience', 'comeback'],
    'PHOENIX'
);

-- Re-enable the trigger
CREATE TRIGGER trigger_auto_add_clan_creator
    AFTER INSERT ON clans
    FOR EACH ROW EXECUTE FUNCTION auto_add_clan_creator();

-- Update member counts for the default clans (they start with 0 members)
UPDATE clans SET member_count = 0 WHERE created_by IS NULL;

-- Create a function for users to join clans
CREATE OR REPLACE FUNCTION join_clan_by_code(p_join_code TEXT, p_user_clerk_id TEXT)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_clan_id UUID;
    v_clan_name TEXT;
    v_current_members INTEGER;
    v_max_members INTEGER;
    v_existing_membership INTEGER;
    result JSON;
BEGIN
    -- Get user profile ID
    SELECT id INTO v_user_id 
    FROM user_profiles 
    WHERE clerk_user_id = p_user_clerk_id;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;
    
    -- Check if user is already in a clan
    SELECT COUNT(*) INTO v_existing_membership
    FROM clan_members 
    WHERE user_id = v_user_id;
    
    IF v_existing_membership > 0 THEN
        RETURN json_build_object('success', false, 'message', 'You are already in a clan. Leave your current clan first.');
    END IF;
    
    -- Find clan by join code
    SELECT id, name, member_count, max_members 
    INTO v_clan_id, v_clan_name, v_current_members, v_max_members
    FROM clans 
    WHERE join_code = UPPER(p_join_code) AND is_public = true;
    
    IF v_clan_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Invalid clan code');
    END IF;
    
    -- Check if clan is full
    IF v_current_members >= v_max_members THEN
        RETURN json_build_object('success', false, 'message', 'Clan is full');
    END IF;
    
    -- Add user to clan
    INSERT INTO clan_members (clan_id, user_id, role, xp_contributed, joined_at)
    VALUES (v_clan_id, v_user_id, 'Member', 0, NOW());
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Successfully joined ' || v_clan_name,
        'clan_name', v_clan_name,
        'clan_id', v_clan_id
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error joining clan: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for users to leave clans
CREATE OR REPLACE FUNCTION leave_clan(p_user_clerk_id TEXT)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_clan_id UUID;
    v_clan_name TEXT;
    v_user_role TEXT;
    v_member_count INTEGER;
    result JSON;
BEGIN
    -- Get user profile ID
    SELECT id INTO v_user_id 
    FROM user_profiles 
    WHERE clerk_user_id = p_user_clerk_id;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;
    
    -- Get user's clan membership
    SELECT cm.clan_id, c.name, cm.role, c.member_count
    INTO v_clan_id, v_clan_name, v_user_role, v_member_count
    FROM clan_members cm
    JOIN clans c ON cm.clan_id = c.id
    WHERE cm.user_id = v_user_id;
    
    IF v_clan_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'You are not in any clan');
    END IF;
    
    -- Check if user is the leader and there are other members
    IF v_user_role = 'Leader' AND v_member_count > 1 THEN
        RETURN json_build_object('success', false, 'message', 'Transfer leadership before leaving the clan');
    END IF;
    
    -- If leader is leaving and they are the only member, delete the clan (for user-created clans)
    -- But keep default clans
    IF v_user_role = 'Leader' AND v_member_count = 1 THEN
        -- Check if this is a default clan (created_by is NULL)
        IF EXISTS (SELECT 1 FROM clans WHERE id = v_clan_id AND created_by IS NOT NULL) THEN
            -- User-created clan - delete it
            DELETE FROM clans WHERE id = v_clan_id;
            RETURN json_build_object('success', true, 'message', 'Left and deleted clan ' || v_clan_name);
        END IF;
    END IF;
    
    -- Remove user from clan
    DELETE FROM clan_members WHERE clan_id = v_clan_id AND user_id = v_user_id;
    
    RETURN json_build_object('success', true, 'message', 'Successfully left ' || v_clan_name);
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error leaving clan: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create new clans
CREATE OR REPLACE FUNCTION create_clan(
    p_name TEXT,
    p_description TEXT,
    p_max_members INTEGER,
    p_is_public BOOLEAN,
    p_user_clerk_id TEXT
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_clan_id UUID;
    v_join_code TEXT;
    v_existing_membership INTEGER;
    result JSON;
BEGIN
    -- Get user profile ID
    SELECT id INTO v_user_id 
    FROM user_profiles 
    WHERE clerk_user_id = p_user_clerk_id;
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;
    
    -- Check if user is already in a clan
    SELECT COUNT(*) INTO v_existing_membership
    FROM clan_members 
    WHERE user_id = v_user_id;
    
    IF v_existing_membership > 0 THEN
        RETURN json_build_object('success', false, 'message', 'You are already in a clan. Leave your current clan first.');
    END IF;
    
    -- Generate unique join code
    v_join_code := generate_join_code();
    WHILE EXISTS (SELECT 1 FROM clans WHERE join_code = v_join_code) LOOP
        v_join_code := generate_join_code();
    END LOOP;
    
    -- Create clan
    INSERT INTO clans (name, description, max_members, is_public, created_by, leader_id, join_code, total_xp, level)
    VALUES (p_name, p_description, p_max_members, p_is_public, v_user_id, v_user_id, v_join_code, 0, 1)
    RETURNING id INTO v_clan_id;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Clan created successfully',
        'clan_id', v_clan_id,
        'join_code', v_join_code
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', 'Error creating clan: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;