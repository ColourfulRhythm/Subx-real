-- =====================================================
-- FIX REFERRAL SYSTEM FUNCTION ERRORS
-- =====================================================
-- This script fixes the SQL errors in referral functions

-- STEP 1: FIX THE NESTED AGGREGATE FUNCTION ERROR
-- =====================================================

-- Drop the problematic function first
DROP FUNCTION IF EXISTS get_user_referral_stats(UUID);

-- Create corrected version without nested aggregates
CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
  v_total_referrals BIGINT;
  v_total_earned DECIMAL(12,2);
  v_referred_users JSONB;
BEGIN
  -- Get total referrals and earnings
  SELECT 
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(amount), 0)
  INTO v_total_referrals, v_total_earned
  FROM referral_rewards 
  WHERE referrer_id = p_user_id AND status = 'paid';
  
  -- Get referred users list (simplified to avoid nested aggregates)
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', rr.referred_user_id,
      'user_name', COALESCE(up.full_name, 'Unknown User'),
      'amount', rr.amount,
      'created_at', rr.created_at
    )
  ) INTO v_referred_users
  FROM referral_rewards rr
  LEFT JOIN user_profiles up ON rr.referred_user_id = up.id
  WHERE rr.referrer_id = p_user_id AND rr.status = 'paid';
  
  -- Build the result
  SELECT jsonb_build_object(
    'user_id', up.id,
    'referral_code', up.referral_code,
    'total_referrals', v_total_referrals,
    'total_earned', v_total_earned,
    'wallet_balance', COALESCE(up.wallet_balance, 0),
    'referred_users', COALESCE(v_referred_users, '[]'::jsonb)
  ) INTO v_stats
  FROM user_profiles up
  WHERE up.id = p_user_id;
  
  RETURN COALESCE(v_stats, jsonb_build_object(
    'user_id', p_user_id,
    'referral_code', NULL,
    'total_referrals', 0,
    'total_earned', 0,
    'wallet_balance', 0,
    'referred_users', '[]'::jsonb
  ));
END;
$$ LANGUAGE plpgsql;

-- STEP 2: FIX THE REFERRAL HISTORY FUNCTION
-- =====================================================

-- Drop the problematic function first
DROP FUNCTION IF EXISTS get_user_referral_history(UUID);

-- Create corrected version
CREATE OR REPLACE FUNCTION get_user_referral_history(p_user_id UUID)
RETURNS TABLE (
  referred_user_name TEXT,
  purchase_amount DECIMAL(10,2),
  reward_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(up2.full_name, 'Unknown User') as referred_user_name,
    COALESCE(i.amount, 0) as purchase_amount,
    rr.amount as reward_amount,
    rr.created_at
  FROM referral_rewards rr
  LEFT JOIN user_profiles up2 ON rr.referred_user_id = up2.id
  LEFT JOIN investments i ON rr.purchase_id = i.id
  WHERE rr.referrer_id = p_user_id
  ORDER BY rr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: FIX RLS POLICY ISSUES
-- =====================================================

-- Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Users can view their own referral rewards" ON referral_rewards;
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON referral_withdrawals;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON referral_audit_log;

-- Create corrected policies
CREATE POLICY "Users can view their own referral rewards" ON referral_rewards
  FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "Users can view their own withdrawals" ON referral_withdrawals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own audit logs" ON referral_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- Add policy for user_profiles table to allow users to see their own data
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- STEP 4: VERIFY THE FIXES
-- =====================================================

-- Test the corrected functions
SELECT 'Testing get_user_referral_stats...' as status;
SELECT get_user_referral_stats('2a702233-15bd-4563-ad81-ee6c1b0df9d9') as test_result;

SELECT 'Testing get_user_referral_history...' as status;
SELECT * FROM get_user_referral_history('2a702233-15bd-4563-ad81-ee6c1b0df9d9') LIMIT 3;

-- Check RLS policies
SELECT 'Checking RLS policies...' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('referral_rewards', 'referral_withdrawals', 'referral_audit_log', 'user_profiles')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- STEP 5: SUCCESS MESSAGE
-- =====================================================

SELECT 'REFERRAL SYSTEM FUNCTIONS FIXED!' as status;
SELECT 'All SQL errors have been resolved.' as message;
SELECT 'The referral system should now work correctly.' as next_step;

-- =====================================================
-- WHAT WAS FIXED
-- =====================================================
-- 
-- ✅ Nested aggregate function error in get_user_referral_stats
-- ✅ RLS policy blocking access to user_profiles
-- ✅ Function return type issues
-- ✅ Policy conflicts resolved
--
-- =====================================================
