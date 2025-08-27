-- =====================================================
-- REFERRAL SYSTEM CLEANUP SCRIPT
-- =====================================================
-- This script drops all conflicting referral functions
-- Run this BEFORE running the fix scripts

-- STEP 1: DROP ALL EXISTING REFERRAL FUNCTIONS
-- =====================================================

-- Drop functions with different signatures
DROP FUNCTION IF EXISTS get_user_referral_history(UUID);
DROP FUNCTION IF EXISTS get_user_referral_history(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_referral_history(UUID, UUID, UUID);

DROP FUNCTION IF EXISTS get_user_referral_stats(UUID);
DROP FUNCTION IF EXISTS get_user_referral_stats(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_referral_stats(UUID, UUID, UUID);

DROP FUNCTION IF EXISTS get_referral_leaderboard();
DROP FUNCTION IF EXISTS get_referral_leaderboard(INTEGER);
DROP FUNCTION IF EXISTS get_referral_leaderboard(UUID);
DROP FUNCTION IF EXISTS get_referral_leaderboard(UUID, INTEGER);

DROP FUNCTION IF EXISTS validate_referral_code(VARCHAR);
DROP FUNCTION IF EXISTS validate_referral_code(VARCHAR, UUID);
DROP FUNCTION IF EXISTS validate_referral_code(VARCHAR, UUID, UUID);

DROP FUNCTION IF EXISTS set_user_referral(UUID, VARCHAR);
DROP FUNCTION IF EXISTS set_user_referral(UUID, VARCHAR, UUID);
DROP FUNCTION IF EXISTS set_user_referral(UUID, VARCHAR, UUID, UUID);

DROP FUNCTION IF EXISTS process_referral_reward(UUID, UUID, DECIMAL);
DROP FUNCTION IF EXISTS process_referral_reward(UUID, UUID, DECIMAL, UUID);
DROP FUNCTION IF EXISTS process_referral_reward(UUID, UUID, DECIMAL, UUID, UUID);

DROP FUNCTION IF EXISTS generate_referral_code();
DROP FUNCTION IF EXISTS generate_referral_code(UUID);
DROP FUNCTION IF EXISTS generate_referral_code(UUID, UUID);

DROP FUNCTION IF EXISTS auto_generate_referral_code();
DROP FUNCTION IF EXISTS auto_generate_referral_code(UUID);

-- Drop any other referral-related functions
DROP FUNCTION IF EXISTS apply_wallet_balance(UUID, DECIMAL);
DROP FUNCTION IF EXISTS apply_wallet_balance(UUID, DECIMAL, UUID);

DROP FUNCTION IF EXISTS get_user_wallet_transactions(UUID);
DROP FUNCTION IF EXISTS get_user_wallet_transactions(UUID, UUID);

DROP FUNCTION IF EXISTS get_referral_analytics(UUID);
DROP FUNCTION IF EXISTS get_referral_analytics(UUID, UUID);

-- STEP 2: DROP TRIGGERS
-- =====================================================

-- Drop triggers that reference the functions
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON user_profiles;
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON users;

-- STEP 3: DROP VIEWS
-- =====================================================

-- Drop views that might reference the functions
DROP VIEW IF EXISTS top_referrers;
DROP VIEW IF EXISTS referral_summary;
DROP VIEW IF EXISTS user_referral_stats;

-- STEP 4: VERIFY CLEANUP
-- =====================================================

-- Check what referral functions remain
SELECT 'Remaining referral functions:' as status;
SELECT proname, prosrc IS NOT NULL as has_source
FROM pg_proc 
WHERE proname LIKE '%referral%'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Check what referral triggers remain
SELECT 'Remaining referral triggers:' as status;
SELECT tgname, tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname LIKE '%referral%'
ORDER BY tgname;

-- Check what referral views remain
SELECT 'Remaining referral views:' as status;
SELECT viewname, schemaname
FROM pg_views 
WHERE viewname LIKE '%referral%'
  AND schemaname = 'public'
ORDER BY viewname;

-- STEP 5: SUCCESS MESSAGE
-- =====================================================

SELECT 'CLEANUP COMPLETE!' as status;
SELECT 'All conflicting referral functions have been dropped.' as message;
SELECT 'You can now run the fix scripts safely.' as next_step;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 
-- 1. ✅ Run this cleanup script first
-- 2. ✅ Then run fix_referral_system_step_by_step.sql
-- 3. ✅ Finally run fix_referral_system_complete.sql
-- 4. ✅ Test with test_referral_system.sql
--
-- =====================================================
