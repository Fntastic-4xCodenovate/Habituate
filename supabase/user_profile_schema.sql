-- User Profile Setup Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    region TEXT,
    bio TEXT,
    
    -- Gamification fields
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    extra_lives INTEGER DEFAULT 0,
    
    -- Clan
    clan_id UUID,
    
    -- Profile completion
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    frequency TEXT CHECK (frequency IN ('daily', 'weekly')) DEFAULT 'daily',
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_completed_date DATE,
    used_extra_life BOOLEAN DEFAULT FALSE,
    extra_life_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp_earned INTEGER DEFAULT 0,
    notes TEXT
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT CHECK (category IN ('streak', 'completion', 'level', 'social', 'clan', 'special')),
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
    requirement_type TEXT,
    requirement_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Create clans table
CREATE TABLE IF NOT EXISTS clans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 50,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clan_members table
CREATE TABLE IF NOT EXISTS clan_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clan_id UUID REFERENCES clans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
    xp_contributed INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clan_id, user_id)
);

-- Add foreign key for clan_id in user_profiles
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_clan 
FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_user_id ON clan_members(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clans_updated_at ON clans;
CREATE TRIGGER update_clans_updated_at
    BEFORE UPDATE ON clans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- DISABLE Row Level Security for Development
-- Note: RLS is disabled to allow Clerk authentication to work
-- For production, you should implement proper RLS policies
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE habits DISABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE clans DISABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members DISABLE ROW LEVEL SECURITY;

-- RLS Policies COMMENTED OUT (Clerk auth doesn't work with these)
-- Uncomment and modify for production use
/*
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
*/

-- RLS Policies for habits (COMMENTED OUT)
/*
CREATE POLICY "Users can view own habits" ON habits
    FOR SELECT USING (user_id IN (
        SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

CREATE POLICY "Users can create own habits" ON habits
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

CREATE POLICY "Users can update own habits" ON habits
    FOR UPDATE USING (user_id IN (
        SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

CREATE POLICY "Users can delete own habits" ON habits
    FOR DELETE USING (user_id IN (
        SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

-- RLS Policies for habit_logs
CREATE POLICY "Users can view own habit logs" ON habit_logs
    FOR SELECT USING (user_id IN (
        SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

CREATE POLICY "Users can create own habit logs" ON habit_logs
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

-- RLS Policies for user_badges
CREATE POLICY "Users can view all badges" ON user_badges
    FOR SELECT USING (true);

-- RLS Policies for clans
CREATE POLICY "Everyone can view public clans" ON clans
    FOR SELECT USING (is_public = true);

-- RLS Policies for clan_members
CREATE POLICY "Everyone can view clan members" ON clan_members
    FOR SELECT USING (true);
*/

-- Insert initial badge definitions
INSERT INTO badges (name, description, icon, category, rarity, requirement_type, requirement_value) VALUES
    ('First Steps', 'Complete your first habit', '🌱', 'completion', 'common', 'total_completions', 1),
    ('Getting Started', 'Complete 10 habits', '🎯', 'completion', 'common', 'total_completions', 10),
    ('Habit Hero', 'Complete 100 habits', '🦸', 'completion', 'rare', 'total_completions', 100),
    ('Legendary', 'Complete 1000 habits', '👑', 'completion', 'legendary', 'total_completions', 1000),
    
    ('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 'common', 'streak', 7),
    ('Month Master', 'Maintain a 30-day streak', '⭐', 'streak', 'rare', 'streak', 30),
    ('Century Club', 'Maintain a 100-day streak', '💯', 'streak', 'epic', 'streak', 100),
    ('Year Round', 'Maintain a 365-day streak', '🏆', 'streak', 'legendary', 'streak', 365),
    
    ('Novice', 'Reach level 5', '🥉', 'level', 'common', 'level', 5),
    ('Expert', 'Reach level 10', '🥈', 'level', 'rare', 'level', 10),
    ('Master', 'Reach level 20', '🥇', 'level', 'epic', 'level', 20),
    
    ('Social Butterfly', 'Join a clan', '🦋', 'social', 'common', 'clan_joined', 1),
    
    ('Team Player', 'Contribute 1000 XP to clan', '🤝', 'clan', 'rare', 'clan_xp', 1000),
    ('Clan Legend', 'Help clan reach level 10', '⚔️', 'clan', 'epic', 'clan_level', 10),
    
    ('Phoenix', 'Earn an extra life', '🔄', 'special', 'rare', 'extra_life_earned', 1),
    ('Quest Master', 'Complete 50 quests', '📜', 'special', 'epic', 'quests_completed', 50)
ON CONFLICT DO NOTHING;

-- Create storage bucket for avatars (if not exists)
-- Note: Run this separately in Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT DO NOTHING;

-- Set up storage policies for avatars bucket
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
--     FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload own avatar" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'avatars' AND 
--         auth.role() = 'authenticated'
--     );

-- CREATE POLICY "Users can update own avatar" ON storage.objects
--     FOR UPDATE USING (
--         bucket_id = 'avatars' AND 
--         auth.role() = 'authenticated'
--     );

-- CREATE POLICY "Users can delete own avatar" ON storage.objects
--     FOR DELETE USING (
--         bucket_id = 'avatars' AND 
--         auth.role() = 'authenticated'
--     );

-- Success message
SELECT 'Database schema created successfully! Remember to create the avatars storage bucket in Supabase Dashboard.' as message;
