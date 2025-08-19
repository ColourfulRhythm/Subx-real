-- Test Referral System Functionality
-- This script tests the referral system components

-- 1. Check if referral system tables exist
SELECT 'Checking referral system tables...' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('referral_rewards', 'referral_audit_log')
ORDER BY table_name;

-- 2. Check if referral functions exist
SELECT 'Checking referral system functions...' as status;

SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%referral%'
ORDER BY routine_name;

-- 3. Check if user_profiles has referral columns
SELECT 'Checking user_profiles referral columns...' as status;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('referral_code', 'referred_by', 'wallet_balance')
ORDER BY column_name;

-- 4. Test referral code generation
SELECT 'Testing referral code generation...' as status;

SELECT generate_referral_code() as test_referral_code;

-- 5. Check existing users and their referral codes
SELECT 'Checking existing users and referral codes...' as status;

SELECT 
  up.id,
  up.full_name,
  up.referral_code,
  up.wallet_balance,
  CASE 
    WHEN up.referred_by IS NOT NULL THEN 'Referred User'
    ELSE 'Original User'
  END as user_type
FROM user_profiles up
ORDER BY up.created_at DESC
LIMIT 10;

-- 6. Test referral validation function
SELECT 'Testing referral code validation...' as status;

-- Test with a valid referral code (replace with actual code from step 5)
SELECT validate_referral_code('SUBX-AB1234') as validation_result;

-- 7. Check top referrers view
SELECT 'Checking top referrers...' as status;

SELECT * FROM top_referrers LIMIT 5;

-- 8. Test user referral stats function (replace with actual user ID)
SELECT 'Testing user referral stats function...' as status;

-- Replace 'user-uuid-here' with an actual user ID from step 5
-- SELECT get_user_referral_stats('user-uuid-here') as user_stats;

-- 9. Check referral audit log
SELECT 'Checking referral audit log...' as status;

SELECT 
  action,
  COUNT(*) as action_count,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence
FROM referral_audit_log
GROUP BY action
ORDER BY action_count DESC;

-- 10. Summary
SELECT 'Referral System Test Summary' as status;

SELECT 
  'Tables' as component,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('referral_rewards', 'referral_audit_log')

UNION ALL

SELECT 
  'Functions' as component,
  COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%referral%'

UNION ALL

SELECT 
  'Users with Referral Codes' as component,
  COUNT(*) as count
FROM user_profiles 
WHERE referral_code IS NOT NULL

UNION ALL

SELECT 
  'Referred Users' as component,
  COUNT(*) as count
FROM user_profiles 
WHERE referred_by IS NOT NULL

UNION ALL

SELECT 
  'Total Referral Rewards' as component,
  COUNT(*) as count
FROM referral_rewards;

-- 11. Test wallet balance application (commented out for safety)
-- SELECT 'Testing wallet balance application...' as status;
-- SELECT apply_wallet_balance('user-uuid-here', 1000.00) as wallet_test;

-- 12. Test referral reward processing (commented out for safety)
-- SELECT 'Testing referral reward processing...' as status;
-- SELECT process_referral_reward('referred-user-uuid', 'purchase-uuid', 50000.00) as reward_test;
