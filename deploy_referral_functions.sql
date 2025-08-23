-- DEPLOY REFERRAL CODE GENERATION FUNCTIONS
-- This script sets up automatic referral code generation for ALL users

-- Step 0: Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  user_type TEXT DEFAULT 'investor',
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  referral_code VARCHAR(12) UNIQUE,
  wallet_balance DECIMAL(15,2) DEFAULT 0.00,
  referred_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 1: Create the generate_referral_code function if it doesn't exist
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

-- Step 2: Create the set_user_referral_code function if it doesn't exist
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

-- Step 3: Create the trigger for automatic referral code generation
DROP TRIGGER IF EXISTS trigger_set_user_referral_code ON user_profiles;

CREATE TRIGGER trigger_set_user_referral_code
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_user_referral_code();

-- Step 4: Fix ALL existing users who don't have referral codes
UPDATE user_profiles 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- Step 5: Create user_profiles for users who don't have them yet
INSERT INTO user_profiles (id, full_name, email, user_type, is_verified, verification_date, referral_code, wallet_balance, referred_by)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', au.email),
  au.email,
  COALESCE(au.raw_user_meta_data->>'user_type', 'investor'),
  false,
  null,
  generate_referral_code(),
  0.00,
  NULL
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 6: Verify the automation is working
SELECT 
  'Total users in auth.users' as description,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total users in user_profiles' as description,
  COUNT(*) as count
FROM user_profiles
UNION ALL
SELECT 
  'Users with referral codes' as description,
  COUNT(*) as count
FROM user_profiles
WHERE referral_code IS NOT NULL AND referral_code != '';

-- Final success message
SELECT '🎉 REFERRAL CODE GENERATION FUNCTIONS DEPLOYED SUCCESSFULLY!' as final_status;
