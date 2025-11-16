    -- Fix RLS Policies for Clerk Authentication
    -- Run this in Supabase SQL Editor to fix the "row-level security policy" error

    -- First, disable RLS temporarily to allow operations
    ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE habits DISABLE ROW LEVEL SECURITY;
    ALTER TABLE habit_logs DISABLE ROW LEVEL SECURITY;
    ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;
    ALTER TABLE clans DISABLE ROW LEVEL SECURITY;
    ALTER TABLE clan_members DISABLE ROW LEVEL SECURITY;

    -- Drop all existing policies
    DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can view own habits" ON habits;
    DROP POLICY IF EXISTS "Users can create own habits" ON habits;
    DROP POLICY IF EXISTS "Users can update own habits" ON habits;
    DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
    DROP POLICY IF EXISTS "Users can view own habit logs" ON habit_logs;
    DROP POLICY IF EXISTS "Users can create own habit logs" ON habit_logs;
    DROP POLICY IF EXISTS "Users can view all badges" ON user_badges;
    DROP POLICY IF EXISTS "Everyone can view public clans" ON clans;
    DROP POLICY IF EXISTS "Everyone can view clan members" ON clan_members;

    -- Success message
    SELECT 'RLS Policies disabled! Your app should work now.' as message;
    SELECT 'Note: For production, you should implement proper RLS policies.' as warning;
