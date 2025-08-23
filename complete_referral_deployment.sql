-- COMPLETE REFERRAL SYSTEM DEPLOYMENT WITH DATA MIGRATION
-- This script handles the entire process: table setup, data migration, and referral system

-- Step 1: Add referral system fields to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE,
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE;

-- Step 2: Create the generate_referral_code function
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
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
    
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

-- Step 3: Create the set_user_referral_code function
CREATE OR REPLACE FUNCTION set_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set referral code if it's not already set
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  
  -- Set default wallet balance if not set
  IF NEW.wallet_balance IS NULL THEN
    NEW.wallet_balance := 0.00;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger for automatic referral code generation
DROP TRIGGER IF EXISTS trigger_set_user_referral_code ON users;

CREATE TRIGGER trigger_set_user_referral_code
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_referral_code();

-- Step 5: Migrate existing data from user_profiles (if table exists)
DO $$
BEGIN
  -- Check if user_profiles table exists and has data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    
    -- Migrate referral data from user_profiles to users
    UPDATE users u 
    SET 
      referral_code = up.referral_code,
      wallet_balance = COALESCE(up.wallet_balance, 0.00),
      referred_by = up.referred_by,
      is_verified = COALESCE(up.is_verified, false),
      verification_date = up.verification_date
    FROM user_profiles up 
    WHERE u.id = up.id
      AND (up.referral_code IS NOT NULL OR up.wallet_balance > 0 OR up.referred_by IS NOT NULL OR up.is_verified = true);
    
    RAISE NOTICE 'Data migrated from user_profiles table';
  ELSE
    RAISE NOTICE 'user_profiles table does not exist, skipping migration';
  END IF;
END $$;

-- Step 6: Generate referral codes for users who don't have them
UPDATE users 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- Step 7: Create user records for auth.users who don't have them yet
INSERT INTO users (id, email, full_name, role, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', au.email),
  COALESCE(au.raw_user_meta_data->>'user_type', 'investor')::user_role,
  au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 8: Verify the deployment
SELECT '🎯 DEPLOYMENT VERIFICATION:' as info;

SELECT 
  'Total users in auth.users' as description,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total users in users table' as description,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 
  'Users with referral codes' as description,
  COUNT(*) as count
FROM users
WHERE referral_code IS NOT NULL AND referral_code != ''
UNION ALL
SELECT 
  'Users with wallet balance' as description,
  COUNT(*) as count
FROM users
WHERE wallet_balance > 0
UNION ALL
SELECT 
  'Verified users' as description,
  COUNT(*) as count
FROM users
WHERE is_verified = true;

-- Step 9: Show sample of working referral system
SELECT '📊 SAMPLE REFERRAL DATA:' as info;
SELECT 
  id,
  email,
  full_name,
  referral_code,
  wallet_balance,
  is_verified,
  verification_date
FROM users 
WHERE referral_code IS NOT NULL 
  OR wallet_balance > 0 
  OR is_verified = true
LIMIT 5;

-- Final success message
SELECT '🎉 REFERRAL SYSTEM FULLY DEPLOYED AND MIGRATED!' as final_status;
