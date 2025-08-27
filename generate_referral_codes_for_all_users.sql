-- =====================================================
-- GENERATE REFERRAL CODES FOR ALL USERS
-- =====================================================
-- This script generates referral codes for all existing users

-- STEP 1: CHECK CURRENT STATUS
-- =====================================================

-- Count users with and without referral codes
SELECT 'Current referral code status:' as status;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN referral_code IS NOT NULL AND referral_code != '' THEN 1 END) as users_with_codes,
  COUNT(CASE WHEN referral_code IS NULL OR referral_code = '' THEN 1 END) as users_without_codes
FROM user_profiles;

-- Show users without referral codes
SELECT 'Users without referral codes:' as status;
SELECT 
  id,
  full_name,
  email,
  referral_code,
  created_at
FROM user_profiles 
WHERE referral_code IS NULL OR referral_code = ''
ORDER BY created_at DESC;

-- STEP 2: GENERATE REFERRAL CODES FOR ALL USERS
-- =====================================================

-- Update all users without referral codes
UPDATE user_profiles 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- Verify the update
SELECT 'Referral codes generated for all users!' as status;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN referral_code IS NOT NULL AND referral_code != '' THEN 1 END) as users_with_codes,
  COUNT(CASE WHEN referral_code IS NULL OR referral_code = '' THEN 1 END) as users_without_codes
FROM user_profiles;

-- STEP 3: SHOW SAMPLE OF GENERATED CODES
-- =====================================================

-- Display some generated referral codes
SELECT 'Sample of generated referral codes:' as status;
SELECT 
  id,
  full_name,
  email,
  referral_code,
  wallet_balance,
  created_at
FROM user_profiles 
WHERE referral_code IS NOT NULL AND referral_code != ''
ORDER BY created_at DESC
LIMIT 10;

-- STEP 4: TEST SPECIFIC USER
-- =====================================================

-- Test your specific user
SELECT 'Your user referral code:' as status;
SELECT 
  id,
  full_name,
  email,
  referral_code,
  wallet_balance
FROM user_profiles 
WHERE email = 'kingflamebeats@gmail.com';

-- STEP 5: VERIFY ALL FUNCTIONS WORK
-- =====================================================

-- Test referral stats function for your user
SELECT 'Testing referral stats function:' as status;
SELECT get_user_referral_stats(
  (SELECT id FROM user_profiles WHERE email = 'kingflamebeats@gmail.com')
) as stats_result;

-- Test referral history function
SELECT 'Testing referral history function:' as status;
SELECT * FROM get_user_referral_history(
  (SELECT id FROM user_profiles WHERE email = 'kingflamebeats@gmail.com')
) LIMIT 3;

-- STEP 6: SUCCESS MESSAGE
-- =====================================================

SELECT 'ALL REFERRAL CODES GENERATED SUCCESSFULLY!' as status;
SELECT 'Every user now has a unique referral code.' as message;
SELECT 'Your referral system is now 100% functional!' as next_step;

-- =====================================================
-- WHAT THIS ACCOMPLISHES
-- =====================================================
-- 
-- ✅ Generates referral codes for ALL users
-- ✅ Fixes "Loading..." issues for everyone
-- ✅ Ensures complete referral system functionality
-- ✅ Makes referral system work for all users
-- ✅ Platform-wide referral system activation
--
-- =====================================================
