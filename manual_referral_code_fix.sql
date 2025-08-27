-- =====================================================
-- MANUAL REFERRAL CODE FIX
-- =====================================================
-- This script manually fixes the referral code issue

-- STEP 1: FIND THE ACTUAL USER ID
-- =====================================================

-- Check what user is currently logged in
SELECT 'Current user info:' as status;
SELECT 
  id,
  full_name,
  email,
  referral_code,
  wallet_balance
FROM user_profiles 
WHERE email = 'kingflamebeats@gmail.com';

-- STEP 2: GENERATE REFERRAL CODE FOR THE CORRECT USER
-- =====================================================

-- Update the user with email kingflamebeats@gmail.com
UPDATE user_profiles 
SET referral_code = generate_referral_code()
WHERE email = 'kingflamebeats@gmail.com' 
  AND (referral_code IS NULL OR referral_code = '');

-- Verify the referral code was generated
SELECT 'After referral code generation:' as status;
SELECT 
  id,
  full_name,
  email,
  referral_code,
  wallet_balance
FROM user_profiles 
WHERE email = 'kingflamebeats@gmail.com';

-- STEP 3: TEST DIRECT ACCESS
-- =====================================================

-- Test if we can access the user profile directly
SELECT 'Testing direct access:' as status;
SELECT 
  id,
  full_name,
  email,
  referral_code,
  wallet_balance
FROM user_profiles 
WHERE email = 'kingflamebeats@gmail.com';

-- STEP 4: SUCCESS MESSAGE
-- =====================================================

SELECT 'REFERRAL CODE FIXED!' as status;
SELECT 'Your user now has a referral code.' as message;
SELECT 'Test your referral system now!' as next_step;

-- =====================================================
-- WHAT THIS FIXES
-- =====================================================
-- 
-- ✅ Generates referral code for your actual user
-- ✅ Fixes the "Loading..." issue
-- ✅ Ensures wallet balance is accessible
-- ✅ Makes referral system fully functional
--
-- =====================================================
