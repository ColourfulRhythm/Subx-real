-- =====================================================
-- TEST REFERRAL SYSTEM FUNCTIONALITY
-- =====================================================
-- Run this after executing fix_referral_system_complete.sql

-- Test 1: Check if all tables exist
SELECT 'Tables Check' as test_type, 
       COUNT(*) as table_count,
       STRING_AGG(tablename, ', ') as tables_found
FROM pg_tables 
WHERE tablename IN ('referral_rewards', 'referral_withdrawals', 'referral_audit_log')
  AND schemaname = 'public';

-- Test 2: Check if all functions exist
SELECT 'Functions Check' as test_type,
       COUNT(*) as function_count,
       STRING_AGG(proname, ', ') as functions_found
FROM pg_proc 
WHERE proname IN (
  'generate_referral_code',
  'get_user_referral_stats',
  'get_user_referral_history',
  'get_referral_leaderboard',
  'validate_referral_code',
  'set_user_referral',
  'process_referral_reward'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Test 3: Check if referral fields were added to user_profiles
SELECT 'User Profiles Check' as test_type,
       COUNT(*) as users_with_referral_codes,
       COUNT(CASE WHEN wallet_balance IS NOT NULL THEN 1 END) as users_with_wallet
FROM user_profiles 
WHERE referral_code IS NOT NULL;

-- Test 4: Test referral code generation
SELECT 'Referral Code Generation' as test_type,
       generate_referral_code() as new_code;

-- Test 5: Check RLS policies
SELECT 'RLS Policies Check' as test_type,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual
FROM pg_policies 
WHERE tablename IN ('referral_rewards', 'referral_withdrawals', 'referral_audit_log')
ORDER BY tablename, policyname;

-- Test 6: Check permissions
SELECT 'Permissions Check' as test_type,
       table_name,
       privilege_type,
       grantee
FROM information_schema.table_privileges 
WHERE table_name IN ('referral_rewards', 'referral_withdrawals', 'referral_audit_log')
  AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- Test 7: Sample user referral stats (if any users exist)
SELECT 'Sample User Stats' as test_type,
       up.id,
       up.full_name,
       up.referral_code,
       up.wallet_balance,
       COUNT(rr.id) as total_referrals,
       COALESCE(SUM(rr.amount), 0) as total_earned
FROM user_profiles up
LEFT JOIN referral_rewards rr ON up.id = rr.referrer_id AND rr.status = 'paid'
WHERE up.referral_code IS NOT NULL
GROUP BY up.id, up.full_name, up.referral_code, up.wallet_balance
LIMIT 3;

-- Test 8: Check if view exists
SELECT 'View Check' as test_type,
       schemaname,
       viewname,
       definition IS NOT NULL as has_definition
FROM pg_views 
WHERE viewname = 'top_referrers'
  AND schemaname = 'public';

-- =====================================================
-- MANUAL TESTING INSTRUCTIONS
-- =====================================================

-- To test the referral system manually:

-- 1. Test referral code validation:
-- SELECT validate_referral_code('SUBX-ABC123');

-- 2. Test getting user referral stats:
-- SELECT get_user_referral_stats('USER_UUID_HERE');

-- 3. Test referral leaderboard:
-- SELECT * FROM get_referral_leaderboard(5);

-- 4. Test setting a referral:
-- SELECT set_user_referral('USER_UUID', 'REFERRAL_CODE');

-- 5. Test processing a referral reward:
-- SELECT process_referral_reward('REFERRED_USER_UUID', 'PURCHASE_UUID', 10000.00);

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- 
-- ✅ Tables Check: Should show 3 tables
-- ✅ Functions Check: Should show 7 functions  
-- ✅ User Profiles Check: Should show users with referral codes
-- ✅ Referral Code Generation: Should generate unique code like "SUBX-ABC123"
-- ✅ RLS Policies: Should show policies for all 3 tables
-- ✅ Permissions: Should show SELECT/INSERT/UPDATE permissions for authenticated users
-- ✅ Sample User Stats: Should show users with referral codes and wallet balances
-- ✅ View Check: Should show top_referrers view exists
--
-- If all tests pass, the referral system is fully functional!
-- =====================================================
