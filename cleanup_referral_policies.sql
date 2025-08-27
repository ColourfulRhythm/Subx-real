-- =====================================================
-- REFERRAL SYSTEM POLICY CLEANUP SCRIPT
-- =====================================================
-- This script drops all conflicting referral policies
-- Run this BEFORE running the fix scripts

-- STEP 1: DROP ALL EXISTING REFERRAL POLICIES
-- =====================================================

-- Drop policies on referral_rewards table
DROP POLICY IF EXISTS "Users can view their own referral rewards" ON referral_rewards;
DROP POLICY IF EXISTS "referral_rewards_select_policy" ON referral_rewards;
DROP POLICY IF EXISTS "referral_rewards_insert_policy" ON referral_rewards;
DROP POLICY IF EXISTS "referral_rewards_update_policy" ON referral_rewards;
DROP POLICY IF EXISTS "referral_rewards_delete_policy" ON referral_rewards;

-- Drop policies on referral_withdrawals table
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON referral_withdrawals;
DROP POLICY IF EXISTS "referral_withdrawals_select_policy" ON referral_withdrawals;
DROP POLICY IF EXISTS "referral_withdrawals_insert_policy" ON referral_withdrawals;
DROP POLICY IF EXISTS "referral_withdrawals_update_policy" ON referral_withdrawals;
DROP POLICY IF EXISTS "referral_withdrawals_delete_policy" ON referral_withdrawals;

-- Drop policies on referral_audit_log table
DROP POLICY IF EXISTS "Users can view their own audit logs" ON referral_audit_log;
DROP POLICY IF EXISTS "referral_audit_log_select_policy" ON referral_audit_log;
DROP POLICY IF EXISTS "referral_audit_log_insert_policy" ON referral_audit_log;
DROP POLICY IF EXISTS "referral_audit_log_update_policy" ON referral_audit_log;
DROP POLICY IF EXISTS "referral_audit_log_delete_policy" ON referral_audit_log;

-- Drop any other referral-related policies
DROP POLICY IF EXISTS "referral_system_policy" ON referral_rewards;
DROP POLICY IF EXISTS "referral_system_policy" ON referral_withdrawals;
DROP POLICY IF EXISTS "referral_system_policy" ON referral_audit_log;

-- STEP 2: VERIFY POLICY CLEANUP
-- =====================================================

-- Check what referral policies remain
SELECT 'Remaining referral policies:' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('referral_rewards', 'referral_withdrawals', 'referral_audit_log')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if RLS is still enabled
SELECT 'RLS Status:' as status;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('referral_rewards', 'referral_withdrawals', 'referral_audit_log')
  AND schemaname = 'public'
ORDER BY tablename;

-- STEP 3: SUCCESS MESSAGE
-- =====================================================

SELECT 'POLICY CLEANUP COMPLETE!' as status;
SELECT 'All conflicting referral policies have been dropped.' as message;
SELECT 'You can now run the fix scripts safely.' as next_step;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 
-- 1. ✅ Run this policy cleanup script first
-- 2. ✅ Then run cleanup_referral_functions.sql
-- 3. ✅ Then run fix_referral_system_step_by_step.sql
-- 4. ✅ Finally run fix_referral_system_complete.sql
-- 5. ✅ Test with test_referral_system.sql
--
-- =====================================================
