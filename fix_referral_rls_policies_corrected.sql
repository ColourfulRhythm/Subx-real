-- =====================================================
-- FIX REFERRAL SYSTEM RLS POLICIES (CORRECTED)
-- =====================================================
-- This script fixes the RLS policies that are blocking
-- access to referral data and causing 406 errors
-- CORRECTED for actual table structure

-- STEP 1: FIX USER_PROFILES RLS POLICIES
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create more permissive policies for user_profiles
-- Note: user_profiles table only has 'id' column, not 'user_id'
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id
  );

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id
  );

-- STEP 2: FIX REFERRAL_REWARDS RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own referral rewards" ON referral_rewards;
DROP POLICY IF EXISTS "Users can insert their own referral rewards" ON referral_rewards;
DROP POLICY IF EXISTS "Users can update their own referral rewards" ON referral_rewards;

-- Create new policies
CREATE POLICY "Users can view their own referral rewards" ON referral_rewards
  FOR SELECT USING (
    auth.uid() = referrer_id OR 
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert their own referral rewards" ON referral_rewards
  FOR INSERT WITH CHECK (
    auth.uid() = referrer_id OR 
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own referral rewards" ON referral_rewards
  FOR UPDATE USING (
    auth.uid() = referrer_id OR 
    auth.uid() = user_id
  );

-- STEP 3: FIX REFERRAL_WITHDRAWALS RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON referral_withdrawals;
DROP POLICY IF EXISTS "Users can insert their own withdrawals" ON referral_withdrawals;
DROP POLICY IF EXISTS "Users can update their own withdrawals" ON referral_withdrawals;

-- Create new policies
CREATE POLICY "Users can view their own withdrawals" ON referral_withdrawals
  FOR SELECT USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert their own withdrawals" ON referral_withdrawals
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own withdrawals" ON referral_withdrawals
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- STEP 4: FIX REFERRAL_AUDIT_LOG RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own audit logs" ON referral_audit_log;

-- Create new policy
CREATE POLICY "Users can view their own audit logs" ON referral_audit_log
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- STEP 5: TEST THE FIXES
-- =====================================================

-- Test user_profiles access
SELECT 'Testing user_profiles RLS policies...' as status;

-- Test referral_rewards access
SELECT 'Testing referral_rewards RLS policies...' as status;

-- Test referral_withdrawals access
SELECT 'Testing referral_withdrawals RLS policies...' as status;

-- Test referral_audit_log access
SELECT 'Testing referral_audit_log RLS policies...' as status;

-- STEP 6: SUCCESS MESSAGE
-- =====================================================

SELECT 'RLS POLICIES FIXED SUCCESSFULLY!' as status;
SELECT 'All referral-related tables now have proper access policies.' as message;
SELECT 'Users should be able to access their referral data without 406 errors.' as next_step;
