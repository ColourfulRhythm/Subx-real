-- =====================================================
-- COMPLETE REFERRAL SYSTEM FIX
-- =====================================================
-- This script fixes all missing referral system components

-- STEP 1: ADD REFERRAL FIELDS TO USER_PROFILES TABLE
-- =====================================================

-- Add referral system fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE,
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES user_profiles(id);

-- STEP 2: CREATE REFERRAL_REWARDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'used_for_purchase', 'withdrawal_pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_amount DECIMAL(12,2),
  used_at TIMESTAMP WITH TIME ZONE,
  withdrawal_amount DECIMAL(12,2),
  withdrawal_requested_at TIMESTAMP WITH TIME ZONE
);

-- STEP 3: CREATE REFERRAL_WITHDRAWALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- STEP 4: CREATE REFERRAL_AUDIT_LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred ON referral_rewards(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_user ON referral_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_status ON referral_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_referral_audit_log_user ON referral_audit_log(user_id);

-- STEP 6: CREATE REFERRAL CODE GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  new_code VARCHAR(12);
  code_exists BOOLEAN;
  attempts INTEGER := 0;
  max_attempts INTEGER := 10;
BEGIN
  LOOP
    -- Generate a random referral code: SUBX-XXXXXX (6 random alphanumeric characters)
    new_code := 'SUBX-' || 
      array_to_string(ARRAY(
        SELECT chr((65 + round(random() * 25))::integer) 
        FROM generate_series(1, 3)
      ), '') ||
      array_to_string(ARRAY(
        SELECT (round(random() * 9))::text 
        FROM generate_series(1, 3)
      ), '');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE referral_code = new_code) INTO code_exists;
    
    -- If code is unique, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
    
    -- Prevent infinite loops
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique referral code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: CREATE AUTO-REFERRAL CODE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if referral_code is not already set
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON user_profiles;
CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- STEP 8: CREATE RPC FUNCTIONS FOR REFERRAL STATS
-- =====================================================

-- Function to get user referral stats
CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', up.id,
    'referral_code', up.referral_code,
    'total_referrals', COALESCE(ref_stats.total_referrals, 0),
    'total_earned', COALESCE(ref_stats.total_earned, 0),
    'wallet_balance', COALESCE(up.wallet_balance, 0),
    'referred_users', COALESCE(ref_users.referred_list, '[]'::jsonb)
  ) INTO v_stats
  FROM user_profiles up
  LEFT JOIN (
    SELECT 
      referrer_id,
      COUNT(*) as total_referrals,
      SUM(amount) as total_earned
    FROM referral_rewards 
    WHERE status = 'paid'
    GROUP BY referrer_id
  ) ref_stats ON up.id = ref_stats.referrer_id
  LEFT JOIN (
    SELECT 
      referrer_id,
      jsonb_agg(
        jsonb_build_object(
          'id', rr.referred_user_id,
          'user_name', ref_up.full_name,
          'total_purchases', COUNT(rr.id),
          'total_earned', SUM(rr.amount)
        )
      ) as referred_list
    FROM referral_rewards rr
    JOIN user_profiles ref_up ON rr.referred_user_id = ref_up.id
    WHERE rr.status = 'paid'
    GROUP BY referrer_id
  ) ref_users ON up.id = ref_users.referrer_id
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

-- Function to get user referral history
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

-- Function to get referral leaderboard
CREATE OR REPLACE FUNCTION get_referral_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  full_name TEXT,
  referral_code VARCHAR(12),
  total_referrals BIGINT,
  total_earned DECIMAL(12,2),
  wallet_balance DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(ref_stats.total_earned, 0) DESC) as rank,
    up.id as user_id,
    up.full_name,
    up.referral_code,
    COALESCE(ref_stats.total_referrals, 0) as total_referrals,
    COALESCE(ref_stats.total_earned, 0) as total_earned,
    COALESCE(up.wallet_balance, 0) as wallet_balance
  FROM user_profiles up
  LEFT JOIN (
    SELECT 
      referrer_id,
      COUNT(*) as total_referrals,
      SUM(amount) as total_earned
    FROM referral_rewards 
    WHERE status = 'paid'
    GROUP BY referrer_id
  ) ref_stats ON up.id = ref_stats.referrer_id
  WHERE up.referral_code IS NOT NULL
  ORDER BY COALESCE(ref_stats.total_earned, 0) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to validate referral code
CREATE OR REPLACE FUNCTION validate_referral_code(p_code VARCHAR(12))
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM user_profiles
  WHERE referral_code = p_code;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to set user referral
CREATE OR REPLACE FUNCTION set_user_referral(
  p_user_id UUID,
  p_referral_code VARCHAR(12)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Validate referral code
  v_referrer_id := validate_referral_code(p_referral_code);
  
  IF v_referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- User cannot refer themselves
  IF v_referrer_id = p_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Update user's referred_by
  UPDATE user_profiles 
  SET referred_by = v_referrer_id
  WHERE id = p_user_id AND referred_by IS NULL;
  
  -- Log the referral
  INSERT INTO referral_audit_log (user_id, action, details)
  VALUES (p_user_id, 'referral_set', 
          jsonb_build_object(
            'referrer_id', v_referrer_id,
            'referral_code', p_referral_code
          ));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to process referral reward
CREATE OR REPLACE FUNCTION process_referral_reward(
  p_referred_user_id UUID,
  p_purchase_id UUID,
  p_purchase_amount DECIMAL(12,2)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referrer_id UUID;
  v_reward_amount DECIMAL(12,2);
  v_reward_id UUID;
BEGIN
  -- Get the referrer for this user
  SELECT referred_by INTO v_referrer_id 
  FROM user_profiles 
  WHERE id = p_referred_user_id;
  
  -- If no referrer, return false
  IF v_referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if reward already exists for this purchase
  IF EXISTS (SELECT 1 FROM referral_rewards WHERE purchase_id = p_purchase_id) THEN
    RETURN FALSE; -- Already processed
  END IF;
  
  -- Calculate reward (5% of purchase amount)
  v_reward_amount := p_purchase_amount * 0.05;
  
  -- Insert referral reward
  INSERT INTO referral_rewards (referrer_id, referred_user_id, purchase_id, amount, status)
  VALUES (v_referrer_id, p_referred_user_id, p_purchase_id, v_reward_amount, 'paid')
  RETURNING id INTO v_reward_id;
  
  -- Update referrer's wallet balance
  UPDATE user_profiles 
  SET wallet_balance = wallet_balance + v_reward_amount
  WHERE id = v_referrer_id;
  
  -- Log the referral reward
  INSERT INTO referral_audit_log (user_id, action, details)
  VALUES (v_referrer_id, 'referral_reward_earned', 
          jsonb_build_object(
            'reward_id', v_reward_id,
            'referred_user_id', p_referred_user_id,
            'purchase_id', p_purchase_id,
            'amount', v_reward_amount
          ));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- STEP 9: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for referral_rewards - users can only see their own rewards
CREATE POLICY "Users can view their own referral rewards" ON referral_rewards
  FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

-- Policy for referral_withdrawals - users can only see their own withdrawals
CREATE POLICY "Users can view their own withdrawals" ON referral_withdrawals
  FOR SELECT USING (user_id = auth.uid());

-- Policy for referral_audit_log - users can only see their own audit logs
CREATE POLICY "Users can view their own audit logs" ON referral_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- STEP 10: GRANT NECESSARY PERMISSIONS
-- =====================================================

GRANT SELECT ON referral_rewards TO authenticated;
GRANT SELECT ON referral_withdrawals TO authenticated;
GRANT SELECT ON referral_audit_log TO authenticated;
GRANT INSERT ON referral_withdrawals TO authenticated;
GRANT UPDATE ON referral_rewards TO authenticated;

-- STEP 11: UPDATE EXISTING USERS WITH REFERRAL CODES
-- =====================================================

-- Update existing users with referral codes (if they don't have one)
UPDATE user_profiles 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- STEP 12: CREATE TOP REFERRERS VIEW
-- =====================================================

CREATE OR REPLACE VIEW top_referrers AS
SELECT 
  up.id,
  up.full_name,
  up.referral_code,
  COUNT(rr.id) as total_referrals,
  SUM(rr.amount) as total_earned,
  up.wallet_balance
FROM user_profiles up
LEFT JOIN referral_rewards rr ON up.id = rr.referrer_id AND rr.status = 'paid'
GROUP BY up.id, up.full_name, up.referral_code, up.wallet_balance
ORDER BY total_earned DESC NULLS LAST;

GRANT SELECT ON top_referrers TO authenticated;

-- STEP 13: VERIFICATION AND TESTING
-- =====================================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('referral_rewards', 'referral_withdrawals', 'referral_audit_log')
ORDER BY tablename;

-- Verify functions were created
SELECT 
  proname,
  prosrc IS NOT NULL as has_source
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
ORDER BY proname;

-- Check referral codes for existing users
SELECT 
  id,
  full_name,
  referral_code,
  wallet_balance
FROM user_profiles 
WHERE referral_code IS NOT NULL
LIMIT 5;

-- =====================================================
-- REFERRAL SYSTEM SETUP COMPLETE!
-- =====================================================
-- 
-- ✅ All tables created
-- ✅ All functions created  
-- ✅ RLS policies enabled
-- ✅ Permissions granted
-- ✅ Existing users updated with referral codes
-- 
-- The referral system is now fully functional!
-- =====================================================
