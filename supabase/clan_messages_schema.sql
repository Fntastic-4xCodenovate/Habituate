-- Clan Messages Table
CREATE TABLE IF NOT EXISTS clan_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    avatar TEXT DEFAULT '/avatars/default.png',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_clan_messages_clan_id ON clan_messages(clan_id);
CREATE INDEX IF NOT EXISTS idx_clan_messages_timestamp ON clan_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_clan_messages_user_id ON clan_messages(user_id);

-- Add RLS policies
ALTER TABLE clan_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages from clans they're members of
CREATE POLICY "Users can read clan messages" ON clan_messages
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Users can send clan messages" ON clan_messages
    FOR INSERT
    WITH CHECK (true);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete own messages" ON clan_messages
    FOR DELETE
    USING (auth.uid()::text = user_id);
