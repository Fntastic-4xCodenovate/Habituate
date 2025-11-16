-- Alter clan table to add leader_id and other improvements
ALTER TABLE clans 
ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS join_code VARCHAR(8) UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clans_leader_id ON clans(leader_id);
CREATE INDEX IF NOT EXISTS idx_clans_join_code ON clans(join_code);
CREATE INDEX IF NOT EXISTS idx_clans_is_public ON clans(is_public);

-- Add trigger to automatically update member_count
CREATE OR REPLACE FUNCTION update_clan_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clans 
        SET member_count = (
            SELECT COUNT(*) FROM clan_members WHERE clan_id = NEW.clan_id
        )
        WHERE id = NEW.clan_id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE clans 
        SET member_count = (
            SELECT COUNT(*) FROM clan_members WHERE clan_id = OLD.clan_id
        )
        WHERE id = OLD.clan_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_clan_member_count ON clan_members;
CREATE TRIGGER trigger_update_clan_member_count
    AFTER INSERT OR DELETE ON clan_members
    FOR EACH ROW EXECUTE FUNCTION update_clan_member_count();

-- Function to generate random join codes
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    char_index INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        char_index := floor(random() * length(chars) + 1)::INTEGER;
        result := result || substr(chars, char_index, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing clans to have join codes
UPDATE clans 
SET join_code = generate_join_code()
WHERE join_code IS NULL;

-- Function to automatically set leader when creating clan
CREATE OR REPLACE FUNCTION set_clan_leader()
RETURNS TRIGGER AS $$
BEGIN
    -- Set leader_id to created_by if not set
    IF NEW.leader_id IS NULL AND NEW.created_by IS NOT NULL THEN
        NEW.leader_id := NEW.created_by;
    END IF;
    
    -- Generate join code if not provided
    IF NEW.join_code IS NULL THEN
        NEW.join_code := generate_join_code();
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM clans WHERE join_code = NEW.join_code AND id != NEW.id) LOOP
            NEW.join_code := generate_join_code();
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new clans
DROP TRIGGER IF EXISTS trigger_set_clan_leader ON clans;
CREATE TRIGGER trigger_set_clan_leader
    BEFORE INSERT OR UPDATE ON clans
    FOR EACH ROW EXECUTE FUNCTION set_clan_leader();

-- Function to automatically add creator as leader when clan is created
CREATE OR REPLACE FUNCTION auto_add_clan_creator()
RETURNS TRIGGER AS $$
BEGIN
    -- Add the creator as a leader member
    IF NEW.created_by IS NOT NULL THEN
        INSERT INTO clan_members (clan_id, user_id, role, xp_contributed, joined_at)
        VALUES (NEW.id, NEW.created_by, 'Leader', 0, NOW())
        ON CONFLICT (clan_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-adding creator
DROP TRIGGER IF EXISTS trigger_auto_add_clan_creator ON clans;
CREATE TRIGGER trigger_auto_add_clan_creator
    AFTER INSERT ON clans
    FOR EACH ROW EXECUTE FUNCTION auto_add_clan_creator();

-- Add RLS policies for clans
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view public clans
CREATE POLICY "Public clans are viewable by everyone" ON clans
    FOR SELECT USING (is_public = true);

-- Policy: Members can view their clan (public or private)
CREATE POLICY "Members can view their own clan" ON clans
    FOR SELECT USING (
        id IN (
            SELECT cm.clan_id 
            FROM clan_members cm 
            JOIN user_profiles up ON cm.user_id = up.id 
            WHERE up.clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Policy: Only authenticated users can create clans
CREATE POLICY "Authenticated users can create clans" ON clans
    FOR INSERT WITH CHECK (
        created_by IN (
            SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Policy: Only leaders can update clan settings
CREATE POLICY "Leaders can update their clan" ON clans
    FOR UPDATE USING (
        leader_id IN (
            SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Policy: Only leaders can delete their clan
CREATE POLICY "Leaders can delete their clan" ON clans
    FOR DELETE USING (
        leader_id IN (
            SELECT id FROM user_profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );