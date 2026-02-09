-- ═══════════════════════════════════════════════════════════════════════════
-- FIXAIR REFERRAL PROGRAM - DATABASE SCHEMA
-- Generated: 2024-02-09
-- Author: KAIZEN (CTO)
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- INSTRUCTIONS FOR HOUSSAM:
-- 1. Run this script in Supabase SQL Editor
-- 2. Enable RLS policies after running
-- 3. Test with a sample referral
--
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: referrals
-- Tracks all referral relationships and bonus grants
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referrer (the user who shared the link)
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Referee (the new user who signed up) - NULL until signup completes
    referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique referral code (e.g., "julien4829")
    referral_code VARCHAR(30) UNIQUE NOT NULL,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    
    -- Bonus tracking
    bonus_granted_referrer BOOLEAN DEFAULT false,
    bonus_granted_referee BOOLEAN DEFAULT false,
    bonus_queries_amount INTEGER DEFAULT 30,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Analytics
    link_clicks INTEGER DEFAULT 0,
    source VARCHAR(50) -- 'whatsapp', 'copy_link', 'email', etc.
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- ALTER TABLE: users
-- Add referral-related columns to existing users table
-- ═══════════════════════════════════════════════════════════════════════════

-- User's own referral code for sharing
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(30) UNIQUE;

-- Bonus queries earned from referrals (added to weekly quota)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_queries INTEGER DEFAULT 0;

-- Who referred this user (nullable)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

-- Referral stats (for gamification)
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

-- Ambassador badge (earned at 3+ referrals)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_ambassador BOOLEAN DEFAULT false;

-- Index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: referral_milestones (optional - for gamification)
-- Tracks milestone achievements
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS referral_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL, -- 'first_referral', 'ambassador', 'super_referrer', 'legend'
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    reward_granted BOOLEAN DEFAULT false,
    
    UNIQUE(user_id, milestone_type)
);

CREATE INDEX IF NOT EXISTS idx_milestones_user ON referral_milestones(user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer or referee)
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_id FROM users WHERE id = referrer_id
            UNION
            SELECT auth_id FROM users WHERE id = referee_id
        )
    );

-- Users can create referrals (when sharing)
CREATE POLICY "Users can create referrals" ON referrals
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT auth_id FROM users WHERE id = referrer_id)
    );

-- System can update referrals (via service role for bonus granting)
-- Note: This requires service role key for actual updates

-- Enable RLS on milestones table
ALTER TABLE referral_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones" ON referral_milestones
    FOR SELECT USING (
        auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id)
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: generate_referral_code
-- Creates a unique referral code from user's first name + random digits
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_referral_code(user_first_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
BEGIN
    -- Clean and lowercase the first name
    base_code := LOWER(REGEXP_REPLACE(COALESCE(user_first_name, 'user'), '[^a-zA-Z]', '', 'g'));
    
    -- Truncate if too long
    IF LENGTH(base_code) > 10 THEN
        base_code := LEFT(base_code, 10);
    END IF;
    
    -- If empty, use 'user'
    IF LENGTH(base_code) = 0 THEN
        base_code := 'user';
    END IF;
    
    -- Try to create unique code
    LOOP
        final_code := base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if unique
        IF NOT EXISTS (SELECT 1 FROM users WHERE referral_code = final_code) 
           AND NOT EXISTS (SELECT 1 FROM referrals WHERE referral_code = final_code) THEN
            RETURN final_code;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            -- Fallback to UUID-based code
            RETURN 'ref' || LEFT(REPLACE(uuid_generate_v4()::TEXT, '-', ''), 8);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: grant_referral_bonus
-- Grants bonus queries to both referrer and referee
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION grant_referral_bonus(
    p_referral_id UUID,
    p_bonus_amount INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
    v_referral referrals%ROWTYPE;
BEGIN
    -- Get the referral record
    SELECT * INTO v_referral FROM referrals WHERE id = p_referral_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Referral not found';
    END IF;
    
    IF v_referral.status != 'completed' THEN
        RAISE EXCEPTION 'Referral not completed';
    END IF;
    
    IF v_referral.bonus_granted_referrer AND v_referral.bonus_granted_referee THEN
        RETURN FALSE; -- Already granted
    END IF;
    
    -- Grant bonus to referrer
    IF NOT v_referral.bonus_granted_referrer THEN
        UPDATE users 
        SET bonus_queries = COALESCE(bonus_queries, 0) + p_bonus_amount,
            total_referrals = COALESCE(total_referrals, 0) + 1
        WHERE id = v_referral.referrer_id;
        
        UPDATE referrals SET bonus_granted_referrer = true WHERE id = p_referral_id;
    END IF;
    
    -- Grant bonus to referee
    IF NOT v_referral.bonus_granted_referee AND v_referral.referee_id IS NOT NULL THEN
        UPDATE users 
        SET bonus_queries = COALESCE(bonus_queries, 0) + p_bonus_amount
        WHERE id = v_referral.referee_id;
        
        UPDATE referrals SET bonus_granted_referee = true WHERE id = p_referral_id;
    END IF;
    
    -- Check for ambassador milestone
    PERFORM check_referral_milestones(v_referral.referrer_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTION: check_referral_milestones
-- Checks and grants milestone achievements
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_referral_milestones(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT total_referrals INTO v_total FROM users WHERE id = p_user_id;
    
    -- First referral milestone
    IF v_total >= 1 THEN
        INSERT INTO referral_milestones (user_id, milestone_type)
        VALUES (p_user_id, 'first_referral')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;
    
    -- Ambassador milestone (3+ referrals)
    IF v_total >= 3 THEN
        INSERT INTO referral_milestones (user_id, milestone_type)
        VALUES (p_user_id, 'ambassador')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
        
        UPDATE users SET is_ambassador = true WHERE id = p_user_id;
    END IF;
    
    -- Super Referrer milestone (5+ referrals)
    IF v_total >= 5 THEN
        INSERT INTO referral_milestones (user_id, milestone_type)
        VALUES (p_user_id, 'super_referrer')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;
    
    -- Legend milestone (10+ referrals)
    IF v_total >= 10 THEN
        INSERT INTO referral_milestones (user_id, milestone_type)
        VALUES (p_user_id, 'legend')
        ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: Auto-generate referral code on user creation
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION trigger_generate_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code(NEW.first_name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS auto_generate_referral_code ON users;
CREATE TRIGGER auto_generate_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_user_referral_code();

-- ═══════════════════════════════════════════════════════════════════════════
-- BACKFILL: Generate referral codes for existing users
-- ═══════════════════════════════════════════════════════════════════════════

-- Run this AFTER creating the trigger to generate codes for existing users
UPDATE users 
SET referral_code = generate_referral_code(first_name)
WHERE referral_code IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run these to verify setup)
-- ═══════════════════════════════════════════════════════════════════════════

-- Check referrals table exists
-- SELECT COUNT(*) FROM referrals;

-- Check users have referral codes
-- SELECT id, first_name, referral_code, bonus_queries FROM users LIMIT 10;

-- Test referral code generation
-- SELECT generate_referral_code('Julien');
-- SELECT generate_referral_code('محمد');
-- SELECT generate_referral_code('');

-- ═══════════════════════════════════════════════════════════════════════════
-- END OF SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════
