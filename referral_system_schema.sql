-- Referral System Database Schema for Subx
-- This script adds referral functionality to the existing database

-- 1. Update user_profiles table to add referral fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0.00;

-- 2. Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_user_id UUID NOT NULL REFERENCES auth.users(id),
  purchase_id INTEGER NOT NULL REFERENCES investments(id), -- Using investments table as purchases
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred ON referral_rewards(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_purchase ON referral_rewards(purchase_id);

-- 4. Create referral_audit_log table for tracking all referral activities
CREATE TABLE IF NOT EXISTS referral_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create top_referrers view for leaderboard
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

-- 6. Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  code VARCHAR(12);
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Generate code like SUBX-AB12CD
    code := 'SUBX-' || 
            chr(65 + (random() * 25)::integer) || 
            chr(65 + (random() * 25)::integer) ||
            lpad((random() * 9999)::integer::text, 4, '0');
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE referral_code = code) THEN
      RETURN code;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique referral code after 100 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to process referral reward
CREATE OR REPLACE FUNCTION process_referral_reward(
  p_referred_user_id UUID,
  p_purchase_id INTEGER,
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

-- 8. Function to apply wallet balance to purchase
CREATE OR REPLACE FUNCTION apply_wallet_balance(
  p_user_id UUID,
  p_amount DECIMAL(12,2)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance DECIMAL(12,2);
BEGIN
  -- Get current wallet balance
  SELECT wallet_balance INTO v_current_balance 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  -- Check if user has sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct from wallet
  UPDATE user_profiles 
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_user_id;
  
  -- Log the wallet usage
  INSERT INTO referral_audit_log (user_id, action, details)
  VALUES (p_user_id, 'wallet_balance_used', 
          jsonb_build_object(
            'amount_used', p_amount,
            'remaining_balance', v_current_balance - p_amount
          ));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger to automatically generate referral code on user signup
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

-- 10. Update existing users with referral codes (if they don't have one)
UPDATE user_profiles 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- 11. Create RLS policies for referral tables
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for referral_rewards - users can only see their own rewards
CREATE POLICY "Users can view their own referral rewards" ON referral_rewards
  FOR SELECT USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

-- Policy for referral_audit_log - users can only see their own audit logs
CREATE POLICY "Users can view their own audit logs" ON referral_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- 12. Grant necessary permissions
GRANT SELECT ON referral_rewards TO authenticated;
GRANT SELECT ON referral_audit_log TO authenticated;
GRANT SELECT ON top_referrers TO authenticated;

-- 13. Create function to get user referral stats
CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
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
          'user_id', rr.referred_user_id,
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
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- 14. Create function to validate referral code
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

-- 15. Create function to set user referral
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

-- 16. Create function to get referral leaderboard
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

-- 17. Create function to process wallet withdrawal
CREATE OR REPLACE FUNCTION process_wallet_withdrawal(
  p_user_id UUID,
  p_amount DECIMAL(12,2),
  p_paystack_recipient_code VARCHAR
)
RETURNS JSONB AS $$
DECLARE
  v_current_balance DECIMAL(12,2);
  v_withdrawal_id UUID;
BEGIN
  -- Get current wallet balance
  SELECT wallet_balance INTO v_current_balance 
  FROM user_profiles 
  WHERE id = p_user_id;
  
  -- Check if user has sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Deduct from wallet
  UPDATE user_profiles 
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_user_id;
  
  -- Log the withdrawal
  INSERT INTO referral_audit_log (user_id, action, details)
  VALUES (p_user_id, 'wallet_withdrawal', 
          jsonb_build_object(
            'amount', p_amount,
            'paystack_recipient_code', p_paystack_recipient_code,
            'remaining_balance', v_current_balance - p_amount
          ))
  RETURNING id INTO v_withdrawal_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal_id,
    'amount', p_amount,
    'remaining_balance', v_current_balance - p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- 18. Create function to get user's referral history
CREATE OR REPLACE FUNCTION get_user_referral_history(p_user_id UUID)
RETURNS TABLE (
  reward_id UUID,
  referred_user_name VARCHAR,
  purchase_amount DECIMAL(12,2),
  reward_amount DECIMAL(12,2),
  status VARCHAR(20),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rr.id as reward_id,
    ref_up.full_name as referred_user_name,
    i.amount as purchase_amount,
    rr.amount as reward_amount,
    rr.status,
    rr.created_at
  FROM referral_rewards rr
  JOIN user_profiles ref_up ON rr.referred_user_id = ref_up.id
  JOIN investments i ON rr.purchase_id = i.id
  WHERE rr.referrer_id = p_user_id
  ORDER BY rr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 19. Create function to get user's wallet transactions
CREATE OR REPLACE FUNCTION get_user_wallet_transactions(p_user_id UUID)
RETURNS TABLE (
  transaction_id UUID,
  action VARCHAR(50),
  amount DECIMAL(12,2),
  details JSONB,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ral.id as transaction_id,
    ral.action,
    CASE 
      WHEN ral.action = 'referral_reward_earned' THEN (ral.details->>'amount')::DECIMAL(12,2)
      WHEN ral.action = 'wallet_balance_used' THEN -(ral.details->>'amount_used')::DECIMAL(12,2)
      WHEN ral.action = 'wallet_withdrawal' THEN -(ral.details->>'amount')::DECIMAL(12,2)
      ELSE 0
    END as amount,
    ral.details,
    ral.created_at
  FROM referral_audit_log ral
  WHERE ral.user_id = p_user_id
  AND ral.action IN ('referral_reward_earned', 'wallet_balance_used', 'wallet_withdrawal')
  ORDER BY ral.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 20. Final verification queries
SELECT 'Schema updated successfully' as status;

-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('referral_rewards', 'referral_audit_log');

-- Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%referral%';
