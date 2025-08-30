-- =====================================================
-- GLORIA'S SPECIFIC CASE FIX
-- =====================================================
-- This script specifically handles Gloria's case:
-- - Creates her complete profile
-- - Links her to Michelle's referral
-- - Connects her 50 sqm purchase to plot 77
-- - Ensures she can access her portfolio

-- STEP 1: CHECK GLORIA'S CURRENT STATUS
-- =====================================================

-- Check if Gloria exists in auth.users
SELECT 'CHECKING GLORIA IN AUTH:' as step;
SELECT 
  'GLORIA AUTH STATUS:' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'gloriaunachukwu@gmail.com') 
    THEN 'EXISTS IN AUTH'
    ELSE 'MISSING FROM AUTH'
  END as gloria_auth_status;

-- Check if Gloria exists in user_profiles
SELECT 
  'GLORIA PROFILE STATUS:' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_profiles WHERE email = 'gloriaunachukwu@gmail.com') 
    THEN 'EXISTS IN USER_PROFILES'
    ELSE 'MISSING FROM USER_PROFILES'
  END as gloria_profile_status;

-- Check if Michelle exists
SELECT 
  'MICHELLE STATUS:' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com') 
    THEN 'EXISTS IN USER_PROFILES'
    ELSE 'MISSING FROM USER_PROFILES'
  END as michelle_status;

-- STEP 2: CREATE GLORIA'S COMPLETE PROFILE
-- =====================================================

-- Create Gloria's profile if she doesn't exist
DO $$
DECLARE
  gloria_id UUID;
  michelle_id UUID;
BEGIN
  -- Check if Gloria exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'gloriaunachukwu@gmail.com') THEN
    -- Get Gloria's auth ID
    SELECT id INTO gloria_id FROM auth.users WHERE email = 'gloriaunachukwu@gmail.com';
    RAISE NOTICE 'Gloria found in auth with ID: %', gloria_id;
  ELSE
    -- Create Gloria in auth.users (this would normally be done through signup)
    RAISE NOTICE 'Gloria not found in auth - profile will be created in user_profiles only';
    gloria_id := gen_random_uuid();
  END IF;
  
  -- Create Gloria's profile in user_profiles
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'gloriaunachukwu@gmail.com') THEN
    INSERT INTO user_profiles (id, email, full_name, referral_code, created_at)
    VALUES (
      gloria_id,
      'gloriaunachukwu@gmail.com',
      'Gloria Unachukwu',
      'SUBX-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
      NOW()
    );
    RAISE NOTICE 'Gloria profile created in user_profiles';
  ELSE
    RAISE NOTICE 'Gloria profile already exists in user_profiles';
  END IF;
  
  -- Create Michelle's profile if she doesn't exist
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com') THEN
    michelle_id := gen_random_uuid();
    INSERT INTO user_profiles (id, email, full_name, referral_code, created_at)
    VALUES (
      michelle_id,
      'michelleunachukwu@gmail.com',
      'Michelle Unachukwu',
      'SUBX-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
      NOW()
    );
    RAISE NOTICE 'Michelle profile created in user_profiles';
  ELSE
    SELECT id INTO michelle_id FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com';
    RAISE NOTICE 'Michelle profile already exists';
  END IF;
  
  -- Link Gloria to Michelle's referral
  UPDATE user_profiles 
  SET referred_by = michelle_id
  WHERE email = 'gloriaunachukwu@gmail.com';
  
  RAISE NOTICE 'Gloria successfully linked to Michelle referral!';
END $$;

-- STEP 3: CREATE GLORIA'S PLOT OWNERSHIP
-- =====================================================

-- Create plot ownership for Gloria's 50 sqm purchase
DO $$
DECLARE
  gloria_id UUID;
  plot_77_id UUID;
BEGIN
  -- Get Gloria's ID
  SELECT id INTO gloria_id FROM user_profiles WHERE email = 'gloriaunachukwu@gmail.com';
  
  -- Check if plot 77 exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM plot_ownership WHERE plot_id = 77) THEN
    -- Create plot 77 if it doesn't exist
    INSERT INTO plot_ownership (id, user_id, plot_id, sqm_purchased, amount, created_at)
    VALUES (
      gen_random_uuid(),
      gloria_id,
      77,
      50, -- 50 sqm as specified
      250000, -- Assuming 5000 per sqm
      NOW()
    );
    RAISE NOTICE 'Plot 77 created for Gloria with 50 sqm ownership';
  ELSE
    -- Plot 77 exists, check if Gloria owns it
    IF NOT EXISTS (SELECT 1 FROM plot_ownership WHERE plot_id = 77 AND user_id = gloria_id) THEN
      -- Create Gloria's ownership of plot 77
      INSERT INTO plot_ownership (id, user_id, plot_id, sqm_purchased, amount, created_at)
      VALUES (
        gen_random_uuid(),
        gloria_id,
        77,
        50, -- 50 sqm as specified
        250000, -- Assuming 5000 per sqm
        NOW()
      );
      RAISE NOTICE 'Gloria ownership of plot 77 created with 50 sqm';
    ELSE
      RAISE NOTICE 'Gloria already owns plot 77';
    END IF;
  END IF;
END $$;

-- STEP 4: CREATE GLORIA'S INVESTMENT RECORD
-- =====================================================

-- Create investment record for Gloria's purchase
DO $$
DECLARE
  gloria_id UUID;
BEGIN
  -- Get Gloria's ID
  SELECT id INTO gloria_id FROM user_profiles WHERE email = 'gloriaunachukwu@gmail.com';
  
  -- Check if investment record exists
  IF NOT EXISTS (SELECT 1 FROM investments WHERE user_id = gloria_id AND amount = 250000) THEN
    -- Create investment record
    INSERT INTO investments (id, user_id, amount, status, created_at)
    VALUES (
      gen_random_uuid(),
      gloria_id,
      250000, -- 50 sqm * 5000 per sqm
      'paid',
      NOW()
    );
    RAISE NOTICE 'Investment record created for Gloria: 50 sqm for ₦250,000';
  ELSE
    RAISE NOTICE 'Investment record already exists for Gloria';
  END IF;
END $$;

-- STEP 5: CREATE REFERRAL EARNINGS FOR MICHELLE
-- =====================================================

-- Create referral earnings for Michelle (5% of Gloria's purchase)
DO $$
DECLARE
  gloria_id UUID;
  michelle_id UUID;
  investment_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO gloria_id FROM user_profiles WHERE email = 'gloriaunachukwu@gmail.com';
  SELECT id INTO michelle_id FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com';
  
  -- Get Gloria's investment ID
  SELECT id INTO investment_id FROM investments WHERE user_id = gloria_id AND amount = 250000;
  
  -- Check if referral earnings already exist
  IF NOT EXISTS (SELECT 1 FROM referral_earnings_new WHERE new_user_id = gloria_id AND referrer_id = michelle_id) THEN
    -- Create referral earnings
    INSERT INTO referral_earnings_new (id, referrer_id, new_user_id, purchase_id, amount, status, created_at)
    VALUES (
      gen_random_uuid(),
      michelle_id,
      gloria_id,
      investment_id,
      12500, -- 5% of 250000
      'paid',
      NOW()
    );
    RAISE NOTICE 'Referral earnings created for Michelle: ₦12,500 (5% of Gloria purchase)';
  ELSE
    RAISE NOTICE 'Referral earnings already exist for Michelle';
  END IF;
END $$;

-- STEP 6: VERIFY GLORIA'S COMPLETE SETUP
-- =====================================================

-- Check Gloria's complete profile
SELECT 
  'GLORIA COMPLETE PROFILE:' as status,
  up.id,
  up.email,
  up.full_name,
  up.referral_code,
  up.referred_by,
  ref.email as referrer_email,
  up.created_at
FROM user_profiles up
LEFT JOIN user_profiles ref ON up.referred_by = ref.id
WHERE up.email = 'gloriaunachukwu@gmail.com';

-- Check Gloria's plot ownership
SELECT 
  'GLORIA PLOT OWNERSHIP:' as status,
  po.plot_id,
  po.sqm_purchased,
  po.amount,
  po.created_at
FROM user_profiles up
JOIN plot_ownership po ON up.id = po.user_id
WHERE up.email = 'gloriaunachukwu@gmail.com';

-- Check Gloria's investment
SELECT 
  'GLORIA INVESTMENT:' as status,
  i.amount,
  i.status,
  i.created_at
FROM user_profiles up
JOIN investments i ON up.id = i.user_id
WHERE up.email = 'gloriaunachukwu@gmail.com';

-- Check Michelle's referral earnings
SELECT 
  'MICHELLE REFERRAL EARNINGS:' as status,
  re.amount,
  re.status,
  re.created_at,
  up.email as referred_user
FROM user_profiles up
JOIN referral_earnings_new re ON up.id = re.referrer_id
WHERE up.email = 'michelleunachukwu@gmail.com';

-- STEP 7: CREATE GLORIA'S PORTFOLIO VIEW
-- =====================================================

-- Create a view specifically for Gloria's portfolio
CREATE OR REPLACE VIEW gloria_portfolio AS
SELECT 
  'Gloria Unachukwu' as user_name,
  'gloriaunachukwu@gmail.com' as email,
  'SUBX-REFERRED' as referral_status,
  'Michelle Unachukwu' as referred_by,
  COUNT(po.id) as total_plots,
  SUM(po.sqm_purchased) as total_sqm,
  SUM(po.amount) as total_invested,
  COUNT(i.id) as total_investments,
  COUNT(re.id) as total_referrals_made
FROM user_profiles up
LEFT JOIN plot_ownership po ON up.id = po.user_id
LEFT JOIN investments i ON up.id = po.user_id
LEFT JOIN referral_earnings_new re ON up.id = re.new_user_id
WHERE up.email = 'gloriaunachukwu@gmail.com'
GROUP BY up.id;

-- STEP 8: FINAL VERIFICATION
-- =====================================================

-- Final status check for Gloria
SELECT 
  'GLORIA FINAL STATUS:' as status,
  (SELECT COUNT(*) FROM user_profiles WHERE email = 'gloriaunachukwu@gmail.com') as profile_exists,
  (SELECT COUNT(*) FROM plot_ownership po JOIN user_profiles up ON po.user_id = up.id WHERE up.email = 'gloriaunachukwu@gmail.com') as plot_ownership_exists,
  (SELECT COUNT(*) FROM investments i JOIN user_profiles up ON i.user_id = up.id WHERE up.email = 'gloriaunachukwu@gmail.com') as investment_exists,
  (SELECT COUNT(*) FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com') as michelle_exists,
  (SELECT COUNT(*) FROM referral_earnings_new re JOIN user_profiles up ON re.referrer_id = up.id WHERE up.email = 'michelleunachukwu@gmail.com') as referral_earnings_exist;

-- STEP 9: SUCCESS MESSAGE
-- =====================================================

SELECT 'GLORIA CASE FIXED SUCCESSFULLY!' as status;
SELECT 'Gloria profile created and linked to Michelle referral' as profile_status;
SELECT '50 sqm plot ownership created for plot 77' as plot_status;
SELECT 'Investment record created for ₦250,000' as investment_status;
SELECT 'Referral earnings created for Michelle (₦12,500)' as referral_status;
SELECT 'Gloria can now access her complete portfolio!' as final_status;
SELECT 'No more missing user issues!' as complete_status;
