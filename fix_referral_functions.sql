-- Fix Referral Functions Return Types
-- Run this in Supabase SQL Editor to fix the data type mismatch

-- 1. Drop and recreate the leaderboard function with correct return types
DROP FUNCTION IF EXISTS get_referral_leaderboard(INTEGER);

CREATE OR REPLACE FUNCTION get_referral_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  full_name VARCHAR,
  referral_code VARCHAR(12),
  total_referrals BIGINT,
  total_earned DECIMAL(12,2),
  wallet_balance DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY tr.total_earned DESC NULLS LAST) as rank,
    tr.id as user_id,
    tr.full_name,
    tr.referral_code,
    tr.total_referrals,
    tr.total_earned,
    tr.wallet_balance
  FROM top_referrers tr
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure all users have referral codes
UPDATE user_profiles 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- 3. Test the function
SELECT 'Testing leaderboard function...' as status;
SELECT * FROM get_referral_leaderboard(5);

-- 4. Verify referral codes exist
SELECT 'Checking referral codes...' as status;
SELECT 
  id,
  full_name,
  referral_code,
  wallet_balance
FROM user_profiles 
WHERE referral_code IS NOT NULL
LIMIT 5;
