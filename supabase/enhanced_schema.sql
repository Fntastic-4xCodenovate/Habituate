-- Enhanced schema for HABITUATE with gamification features
-- This extends the base schema with XP, badges, clans, and extra lives

-- Drop existing tables if recreating
-- DROP TABLE IF EXISTS user_badges CASCADE;
-- DROP TABLE IF EXISTS badges CASCADE;
-- DROP TABLE IF EXISTS clan_messages CASCADE;
-- DROP TABLE IF EXISTS clan_members CASCADE;
-- DROP TABLE IF EXISTS clans CASCADE;
-- DROP TABLE IF EXISTS user_quests CASCADE;
-- DROP TABLE IF EXISTS quests CASCADE;
-- DROP TABLE IF EXISTS habit_logs CASCADE;
-- DROP TABLE IF EXISTS habits CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- User Profiles (Enhanced)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  extra_lives INTEGER DEFAULT 0,
  clan_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits (Enhanced with extra life tracking)
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  category TEXT,
  difficulty TEXT DEFAULT 'medium',
  is_public BOOLEAN DEFAULT FALSE,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  last_completed TIMESTAMP WITH TIME ZONE,
  missed_days INTEGER DEFAULT 0,
  used_extra_life BOOLEAN DEFAULT FALSE,
  extra_life_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit Logs (Enhanced with XP tracking)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 0,
  notes TEXT
);

-- Badges System
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  badge_type TEXT NOT NULL, -- streak, completion, level, social, clan, special
  rarity TEXT NOT NULL, -- common, rare, epic, legendary
  requirement INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badges (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Clans System
CREATE TABLE IF NOT EXISTS clans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏰',
  owner_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id),
  is_private BOOLEAN DEFAULT FALSE,
  max_members INTEGER DEFAULT 50,
  total_xp BIGINT DEFAULT 0,
  level INTEGER DEFAULT 1,
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clan Members
CREATE TABLE IF NOT EXISTS clan_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  xp_contributed BIGINT DEFAULT 0,
  role TEXT DEFAULT 'member', -- member, moderator, leader
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clan_id, user_id)
);

-- Clan Messages (for clan chat)
CREATE TABLE IF NOT EXISTS clan_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quests System
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type TEXT NOT NULL, -- daily, weekly, special
  xp_reward INTEGER NOT NULL,
  requirement INTEGER NOT NULL,
  requirement_type TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Quests (Tracking)
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active', -- active, completed, expired
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, quest_id)
);

-- Add foreign key for clan_id in user_profiles
ALTER TABLE user_profiles
ADD CONSTRAINT fk_user_clan
FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id ON clan_members(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_messages_clan_id ON clan_messages(clan_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_messages ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read all profiles, update only their own
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (clerk_user_id = auth.uid());

-- Habits: Users can CRUD their own habits, read public habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view public habits" ON habits
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own habits" ON habits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (user_id = auth.uid());

-- Habit Logs: Users can view and create their own logs
CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Badges: Everyone can read, system creates
CREATE POLICY "Badges are viewable by everyone" ON badges
  FOR SELECT USING (true);

-- User Badges: Users can view their own badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (user_id = auth.uid());

-- Clans: Everyone can read public clans
CREATE POLICY "Public clans are viewable" ON clans
  FOR SELECT USING (is_private = false);

CREATE POLICY "Clan members can view private clans" ON clans
  FOR SELECT USING (
    is_private = true AND 
    id IN (SELECT clan_id FROM clan_members WHERE user_id = auth.uid())
  );

-- Clan Members: Members can view clan members
CREATE POLICY "Clan members can view members" ON clan_members
  FOR SELECT USING (
    clan_id IN (SELECT clan_id FROM clan_members WHERE user_id = auth.uid())
  );

-- Clan Messages: Members can view and send messages
CREATE POLICY "Clan members can view messages" ON clan_messages
  FOR SELECT USING (
    clan_id IN (SELECT clan_id FROM clan_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Clan members can send messages" ON clan_messages
  FOR INSERT WITH CHECK (
    clan_id IN (SELECT clan_id FROM clan_members WHERE user_id = auth.uid())
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clans_updated_at
  BEFORE UPDATE ON clans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial badges
INSERT INTO badges (name, description, icon, badge_type, rarity, requirement, xp_reward)
VALUES
  ('First Steps', 'Complete your first habit', '🎯', 'streak', 'common', 1, 10),
  ('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', 'common', 7, 25),
  ('Monthly Master', 'Maintain a 30-day streak', '💪', 'streak', 'rare', 30, 100),
  ('Century Club', 'Reach 100-day streak - Extra life unlocked!', '💎', 'streak', 'epic', 100, 500),
  ('Legendary Streak', 'Maintain a 365-day streak', '👑', 'streak', 'legendary', 365, 1000),
  ('Habit Starter', 'Complete 10 habits', '⭐', 'completion', 'common', 10, 20),
  ('Habit Builder', 'Complete 50 habits', '🌟', 'completion', 'rare', 50, 75),
  ('Habit Master', 'Complete 100 habits', '✨', 'completion', 'epic', 100, 200),
  ('Novice', 'Reach level 5', '🥉', 'level', 'common', 5, 50),
  ('Expert', 'Reach level 10', '🥈', 'level', 'rare', 10, 100),
  ('Elite', 'Reach level 20', '🥇', 'level', 'epic', 20, 250),
  ('Team Player', 'Join a clan', '🤝', 'social', 'common', 1, 15),
  ('Clan Contributor', 'Contribute 500 XP to clan', '🏆', 'clan', 'rare', 500, 100),
  ('Clan Legend', 'Contribute 5000 XP to clan', '👑', 'clan', 'legendary', 5000, 500),
  ('Phoenix', 'Use an extra life to restore a streak', '🔄', 'special', 'rare', 1, 75),
  ('Perfectionist', 'Complete all habits for 30 days', '💯', 'special', 'epic', 30, 300)
ON CONFLICT (name) DO NOTHING;
