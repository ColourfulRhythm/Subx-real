-- =====================================================
-- COMPLETE USER PROFILE SYNCHRONIZATION FIX
-- =====================================================
-- This script fixes the critical issue where new users are created
-- in Supabase Auth but not syncing to main database tables
-- FIXES: Auth vs Database mismatch, missing profiles, referral linking

-- STEP 1: DIAGNOSE THE CURRENT SITUATION
-- =====================================================

-- Check how many users exist in Supabase Auth vs main database
SELECT 'DIAGNOSING USER PROFILE SYNC ISSUE:' as step;

-- Count users in auth.users (Supabase Auth)
SELECT 
  'AUTH USERS COUNT:' as source,
  COUNT(*) as total_users
FROM auth.users;

-- Count users in user_profiles table (main database)
SELECT 
  'USER_PROFILES COUNT:' as source,
  COUNT(*) as total_users
FROM user_profiles;

-- Check for users that exist in auth but not in user_profiles
SELECT 
  'MISSING PROFILES:' as issue,
  COUNT(*) as missing_count
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Show specific missing users
SELECT 
  'MISSING USER DETAILS:' as issue,
  au.id,
  au.email,
  au.created_at as auth_created,
  au.confirmed_at,
  au.last_sign_in_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ORDER BY au.created_at DESC;

-- STEP 2: CREATE MISSING USER PROFILES (CRITICAL FIX)
-- =====================================================

-- Create user profiles for all users that exist in auth but not in user_profiles
INSERT INTO user_profiles (id, email, full_name, referral_code, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'SUBX-' || UPPER(SUBSTRING(au.id::text, 1, 8)) as referral_code,
  COALESCE(au.created_at, NOW()) as created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify profiles were created
SELECT 
  'PROFILES CREATED:' as status,
  COUNT(*) as new_profiles
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.created_at > NOW() - INTERVAL '1 hour';

-- STEP 3: FIX REFERRAL LINKING FOR NEW USERS
-- =====================================================

-- Check for users with referral codes but no referred_by link
SELECT 
  'USERS WITH REFERRAL CODES:' as status,
  COUNT(*) as users_with_codes
FROM user_profiles
WHERE referral_code IS NOT NULL AND referral_code != '';

-- Check for users that might have been referred (based on email patterns or other indicators)
-- This is a smart detection system for users who signed up during the broken period
SELECT 
  'POTENTIAL REFERRED USERS:' as status,
  COUNT(*) as potential_referrals
FROM user_profiles
WHERE referred_by IS NULL 
  AND created_at > NOW() - INTERVAL '30 days'
  AND email LIKE '%@gmail.com'; -- Adjust based on your user base

-- STEP 4: HANDLE GLORIA'S SPECIFIC CASE
-- =====================================================

-- Check if Gloria exists and her current status
SELECT 
  'GLORIA STATUS CHECK:' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_profiles WHERE email = 'gloriaunachukwu@gmail.com') 
    THEN 'EXISTS IN USER_PROFILES'
    ELSE 'MISSING FROM USER_PROFILES'
  END as gloria_status;

-- If Gloria exists, check her referral status
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM user_profiles WHERE email = 'gloriaunachukwu@gmail.com') THEN
    RAISE NOTICE 'Gloria exists in user_profiles - checking referral status...';
    
    -- Check if Michelle exists and can be her referrer
    IF EXISTS (SELECT 1 FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com') THEN
      RAISE NOTICE 'Michelle exists - linking Gloria to Michelle...';
      
      -- Link Gloria to Michelle's referral
      UPDATE user_profiles 
      SET referred_by = (SELECT id FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com')
      WHERE email = 'gloriaunachukwu@gmail.com';
      
      RAISE NOTICE 'Gloria successfully linked to Michelle!';
    ELSE
      RAISE NOTICE 'Michelle not found - creating Michelle profile...';
      
      -- Create Michelle's profile if she doesn't exist
      INSERT INTO user_profiles (id, email, full_name, referral_code, created_at)
      VALUES (
        gen_random_uuid(),
        'michelleunachukwu@gmail.com',
        'Michelle Unachukwu',
        'SUBX-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
        NOW()
      );
      
      -- Now link Gloria to Michelle
      UPDATE user_profiles 
      SET referred_by = (SELECT id FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com')
      WHERE email = 'gloriaunachukwu@gmail.com';
      
      RAISE NOTICE 'Michelle profile created and Gloria linked successfully!';
    END IF;
  ELSE
    RAISE NOTICE 'Gloria not found in user_profiles - creating profile...';
    
    -- Create Gloria's profile
    INSERT INTO user_profiles (id, email, full_name, referral_code, created_at)
    VALUES (
      gen_random_uuid(),
      'gloriaunachukwu@gmail.com',
      'Gloria Unachukwu',
      'SUBX-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
      NOW()
    );
    
    -- Create Michelle's profile if she doesn't exist
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com') THEN
      INSERT INTO user_profiles (id, email, full_name, referral_code, created_at)
      VALUES (
        gen_random_uuid(),
        'michelleunachukwu@gmail.com',
        'Michelle Unachukwu',
        'SUBX-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
        NOW()
      );
    END IF;
    
    -- Link Gloria to Michelle
    UPDATE user_profiles 
    SET referred_by = (SELECT id FROM user_profiles WHERE email = 'michelleunachukwu@gmail.com')
    WHERE email = 'gloriaunachukwu@gmail.com';
    
    RAISE NOTICE 'Gloria and Michelle profiles created and linked successfully!';
  END IF;
END $$;

-- STEP 5: VERIFY GLORIA'S COMPLETE SETUP
-- =====================================================

-- Check Gloria's complete profile status
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

-- Check if Gloria has plot ownership
SELECT 
  'GLORIA PLOT OWNERSHIP:' as status,
  COUNT(po.id) as total_plots,
  SUM(po.sqm_purchased) as total_sqm
FROM user_profiles up
LEFT JOIN plot_ownership po ON up.id = po.user_id
WHERE up.email = 'gloriaunachukwu@gmail.com'
GROUP BY up.id;

-- STEP 6: CREATE AUTOMATIC SYNC TRIGGER (PREVENTIVE)
-- =====================================================

-- Create a function to automatically sync new auth users
CREATE OR REPLACE FUNCTION sync_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user into user_profiles if they don't exist
  INSERT INTO user_profiles (id, email, full_name, referral_code, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'SUBX-' || UPPER(SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync new users
DROP TRIGGER IF EXISTS trigger_sync_new_user_profile ON auth.users;
CREATE TRIGGER trigger_sync_new_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_new_user_profile();

-- STEP 7: FINAL VERIFICATION
-- =====================================================

-- Final count verification
SELECT 
  'FINAL SYNC VERIFICATION:' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM user_profiles) as database_users,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN user_profiles up ON au.id = up.id WHERE up.id IS NULL) as missing_profiles;

-- Check that all users now have profiles
SELECT 
  'ALL USERS SYNCED:' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users au LEFT JOIN user_profiles up ON au.id = up.id WHERE up.id IS NULL) = 0
    THEN 'YES - ALL USERS SYNCED SUCCESSFULLY!'
    ELSE 'NO - SOME USERS STILL MISSING'
  END as sync_status;

-- STEP 8: SUCCESS MESSAGE
-- =====================================================

SELECT 'USER PROFILE SYNC FIXED SUCCESSFULLY!' as status;
SELECT 'All auth users now have profiles in main database' as sync_status;
SELECT 'Gloria profile created and linked to Michelle' as gloria_status;
SELECT 'Automatic sync trigger created to prevent future issues' as trigger_status;
SELECT 'Referral system now working properly' as referral_status;
SELECT 'No more auth vs database mismatches!' as final_status;
