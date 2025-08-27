-- =====================================================
-- REFERRAL SYSTEM STEP-BY-STEP FIX
-- =====================================================
-- This script fixes the referral system step by step

-- STEP 1: VERIFY CURRENT STATE
-- =====================================================

-- Check if user_profiles table exists
SELECT 'Checking user_profiles table...' as status;
SELECT schemaname, tablename, tableowner
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Check current user_profiles structure
SELECT 'Checking user_profiles columns...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- STEP 2: CREATE USER_PROFILES TABLE IF MISSING
-- =====================================================

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  occupation TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Referral system fields
  referral_code VARCHAR(12) UNIQUE,
  wallet_balance DECIMAL(15,2) DEFAULT 0.00,
  referred_by UUID REFERENCES user_profiles(id)
);

-- STEP 3: ADD MISSING COLUMNS SAFELY
-- =====================================================

-- Add referral system columns if they don't exist
DO $$
BEGIN
  -- Add referral_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN referral_code VARCHAR(12);
    RAISE NOTICE 'Added referral_code column';
  ELSE
    RAISE NOTICE 'referral_code column already exists';
  END IF;

  -- Add wallet_balance column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'wallet_balance'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN wallet_balance DECIMAL(15,2) DEFAULT 0.00;
    RAISE NOTICE 'Added wallet_balance column';
  ELSE
    RAISE NOTICE 'wallet_balance column already exists';
  END IF;

  -- Add referred_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN referred_by UUID REFERENCES user_profiles(id);
    RAISE NOTICE 'Added referred_by column';
  ELSE
    RAISE NOTICE 'referred_by column already exists';
  END IF;
END $$;

-- STEP 4: ADD UNIQUE CONSTRAINT
-- =====================================================

-- Add unique constraint for referral_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_referral_code'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT unique_referral_code UNIQUE (referral_code);
    RAISE NOTICE 'Added unique_referral_code constraint';
  ELSE
    RAISE NOTICE 'unique_referral_code constraint already exists';
  END IF;
END $$;

-- STEP 5: VERIFY COLUMNS ADDED
-- =====================================================

-- Verify all columns are present
SELECT 'Verifying columns added...' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('referral_code', 'wallet_balance', 'referred_by')
ORDER BY column_name;

-- STEP 6: CREATE REFERRAL TABLES
-- =====================================================

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'used_for_purchase', 'withdrawal_pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_amount DECIMAL(12,2),
  used_at TIMESTAMP WITH TIME ZONE,
  withdrawal_amount DECIMAL(12,2),
  withdrawal_requested_at TIMESTAMP WITH TIME ZONE
);

-- Create referral_withdrawals table
CREATE TABLE IF NOT EXISTS referral_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Create referral_audit_log table
CREATE TABLE IF NOT EXISTS referral_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 7: CREATE INDEXES
-- =====================================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred ON referral_rewards(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_user ON referral_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_status ON referral_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_referral_audit_log_user ON referral_audit_log(user_id);

-- STEP 8: CREATE FUNCTIONS
-- =====================================================

-- Create generate_referral_code function
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  new_code VARCHAR(12);
  code_exists BOOLEAN;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Generate a random referral code: SUBX-XXXXXX (6 random alphanumeric characters)
    new_code := 'SUBX-' || 
      array_to_string(ARRAY(
        SELECT chr((65 + round(random() * 25))::integer) 
        FROM generate_series(1, 3)
      ), '') ||
      array_to_string(ARRAY(
        SELECT (round(random() * 9))::text 
        FROM generate_series(1, 3)
      ), '');
    
    -- Check if code already exists in user_profiles only
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE referral_code = new_code) INTO code_exists;
    
    -- If code is unique, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
    
    -- Prevent infinite loops
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique referral code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- STEP 9: VERIFY FIX
-- =====================================================

-- Test referral code generation
SELECT 'Testing referral code generation...' as status;
SELECT generate_referral_code() as test_code;

-- Check if all tables exist
SELECT 'Checking tables...' as status;
SELECT tablename, schemaname
FROM pg_tables 
WHERE tablename IN ('referral_rewards', 'referral_withdrawals', 'referral_audit_log')
  AND schemaname = 'public'
ORDER BY tablename;

-- Check if function exists
SELECT 'Checking function...' as status;
SELECT proname, prosrc IS NOT NULL as has_source
FROM pg_proc 
WHERE proname = 'generate_referral_code'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- STEP 10: SUCCESS MESSAGE
-- =====================================================

SELECT 'REFERRAL SYSTEM FIX COMPLETE!' as status;
SELECT 'All tables and functions created successfully.' as message;
SELECT 'You can now run the complete fix script.' as next_step;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 
-- 1. ✅ Run this script first to fix the table structure
-- 2. ✅ Then run fix_referral_system_complete.sql for full functionality
-- 3. ✅ Finally run test_referral_system.sql to verify everything
--
-- =====================================================
