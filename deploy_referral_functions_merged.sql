-- DEPLOY REFERRAL CODE GENERATION FUNCTIONS (MERGED INTO USERS TABLE)
-- This script sets up automatic referral code generation for ALL users in the existing users table

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

-- Step 5: Fix ALL existing users who don't have referral codes
UPDATE users 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- Step 6: Create user records for auth.users who don't have them yet
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

-- Step 7: Verify the automation is working
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
WHERE referral_code IS NOT NULL AND referral_code != '';

-- Final success message
SELECT '🎉 REFERRAL CODE GENERATION FUNCTIONS DEPLOYED SUCCESSFULLY IN MERGED USERS TABLE!' as final_status;
