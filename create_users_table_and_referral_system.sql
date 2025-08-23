-- CREATE USERS TABLE AND REFERRAL SYSTEM FROM SCRATCH
-- This script creates everything needed for the referral system

-- Step 1: Create the users table with all necessary fields
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  profile_image_url TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  postal_code TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_documents JSONB,
  total_investments DECIMAL(15,2) DEFAULT 0,
  total_properties INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Referral system fields
  referral_code VARCHAR(12) UNIQUE,
  wallet_balance DECIMAL(15,2) DEFAULT 0.00,
  referred_by UUID REFERENCES public.users(id),
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE
);

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

-- Step 5: Create user records for all existing auth.users
INSERT INTO users (id, email, full_name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', au.email),
  au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
  AND au.deleted_at IS NULL  -- Don't create records for deleted users
ON CONFLICT (id) DO NOTHING;

-- Step 6: Generate referral codes for all users
UPDATE users 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- Step 7: Verify the setup
SELECT '🎯 SETUP VERIFICATION:' as info;

SELECT 
  'Total users in auth.users' as description,
  COUNT(*) as count
FROM auth.users
WHERE deleted_at IS NULL
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

-- Step 8: Show sample of working referral system
SELECT '📊 SAMPLE REFERRAL DATA:' as info;
SELECT 
  id,
  email,
  full_name,
  referral_code,
  wallet_balance,
  created_at
FROM users 
LIMIT 5;

-- Final success message
SELECT '🎉 USERS TABLE AND REFERRAL SYSTEM CREATED SUCCESSFULLY!' as final_status;
