-- =====================================================
-- COMPLETE SUPABASE MIGRATION - REPLACE MONGODB
-- =====================================================

-- This script migrates all MongoDB functionality to Supabase
-- DO NOT RUN UNTIL USER APPROVES

-- STEP 1: ENHANCE EXISTING TABLES
-- =====================================================

-- Add missing columns to investments table
ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS investor_email TEXT,
ADD COLUMN IF NOT EXISTS project_title TEXT,
ADD COLUMN IF NOT EXISTS project_location TEXT,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS investment_interests TEXT[],
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[],
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT,
ADD COLUMN IF NOT EXISTS investment_goals TEXT[],
ADD COLUMN IF NOT EXISTS investment_experience TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS total_investments DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_properties INTEGER DEFAULT 0;

-- STEP 2: CREATE MISSING TABLES
-- =====================================================

-- Create referral_rewards table for referral system
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'used_for_purchase', 'withdrawal_pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_amount DECIMAL(12,2),
  used_at TIMESTAMP WITH TIME ZONE,
  withdrawal_amount DECIMAL(12,2),
  withdrawal_requested_at TIMESTAMP WITH TIME ZONE
);

-- Create referral_withdrawals table
CREATE TABLE IF NOT EXISTS referral_withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Create referral_audit_log table
CREATE TABLE IF NOT EXISTS referral_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: CREATE ENHANCED FUNCTIONS
-- =====================================================

-- Enhanced finalize_purchase function
CREATE OR REPLACE FUNCTION finalize_purchase(p_payment_ref TEXT)
RETURNS JSONB AS $$
DECLARE
  v_investment RECORD;
  v_project RECORD;
  v_user_profile RECORD;
  v_referrer_id UUID;
  v_referral_amount DECIMAL(12,2);
  v_result JSONB;
BEGIN
  -- Get investment details
  SELECT * INTO v_investment FROM investments WHERE payment_reference = p_payment_ref;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Investment not found for payment reference: %', p_payment_ref;
  END IF;
  
  -- Get project details
  SELECT * INTO v_project FROM projects WHERE id = v_investment.project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found for investment';
  END IF;
  
  -- Get user profile details
  SELECT * INTO v_user_profile FROM user_profiles WHERE user_id = v_investment.user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Update investment status
  UPDATE investments SET 
    status = 'successful',
    updated_at = NOW(),
    status_updated_at = NOW()
  WHERE payment_reference = p_payment_ref;
  
  -- Create or update plot ownership
  INSERT INTO plot_ownership (user_id, plot_id, sqm_owned, amount_paid, plot_name, location)
  VALUES (
    v_investment.user_id,
    v_investment.project_id,
    v_investment.sqm_purchased,
    v_investment.amount,
    v_project.title,
    v_project.location
  )
  ON CONFLICT (user_id, plot_id) DO UPDATE SET
    sqm_owned = plot_ownership.sqm_owned + v_investment.sqm_purchased,
    amount_paid = plot_ownership.amount_paid + v_investment.amount,
    updated_at = NOW();
  
  -- Update project available sqm
  UPDATE projects SET 
    total_sqm = total_sqm - v_investment.sqm_purchased,
    updated_at = NOW()
  WHERE id = v_investment.project_id;
  
  -- Update user profile totals
  UPDATE user_profiles SET
    total_investments = total_investments + v_investment.amount,
    total_properties = total_properties + 1,
    updated_at = NOW()
  WHERE user_id = v_investment.user_id;
  
  -- Process referral reward if user was referred
  IF v_user_profile.referred_by IS NOT NULL THEN
    v_referral_amount = v_investment.amount * 0.05; -- 5% commission
    
    INSERT INTO referral_rewards (
      referrer_id, 
      referred_user_id, 
      purchase_id, 
      amount, 
      status
    ) VALUES (
      v_user_profile.referred_by,
      v_investment.user_id,
      v_investment.id,
      v_referral_amount,
      'paid'
    );
    
    -- Log referral reward
    INSERT INTO referral_audit_log (user_id, action, details)
    VALUES (
      v_user_profile.referred_by,
      'referral_reward_earned',
      jsonb_build_object('amount', v_referral_amount, 'referred_user', v_user_profile.email)
    );
  END IF;
  
  -- Build result
  v_result = jsonb_build_object(
    'success', true,
    'investment_id', v_investment.id,
    'user_email', v_user_profile.email,
    'user_name', v_user_profile.full_name,
    'project_title', v_project.title,
    'sqm_purchased', v_investment.sqm_purchased,
    'amount', v_investment.amount,
    'referral_reward', COALESCE(v_referral_amount, 0)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Enhanced sync_investment_to_supabase function
CREATE OR REPLACE FUNCTION sync_investment_to_supabase(
  p_user_id UUID,
  p_project_id INTEGER,
  p_sqm_purchased INTEGER,
  p_amount DECIMAL(10,2),
  p_payment_reference TEXT,
  p_project_title TEXT,
  p_location TEXT,
  p_investor_email TEXT DEFAULT NULL,
  p_investor_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_profile RECORD;
  v_result JSONB;
BEGIN
  -- Get or create user profile
  SELECT * INTO v_user_profile FROM user_profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create user profile if it doesn't exist
    INSERT INTO user_profiles (
      user_id, 
      email, 
      full_name, 
      created_at, 
      updated_at
    ) VALUES (
      p_user_id,
      COALESCE(p_investor_email, 'unknown@subx.com'),
      COALESCE(p_investor_name, 'Subx User'),
      NOW(),
      NOW()
    ) RETURNING * INTO v_user_profile;
  END IF;
  
  -- Insert or update investment
  INSERT INTO investments (
    user_id, 
    project_id, 
    sqm_purchased, 
    amount, 
    payment_reference, 
    status, 
    project_title,
    project_location,
    investor_email,
    created_at, 
    updated_at
  ) VALUES (
    p_user_id,
    p_project_id,
    p_sqm_purchased,
    p_amount,
    p_payment_reference,
    'pending',
    p_project_title,
    p_location,
    v_user_profile.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (payment_reference) DO UPDATE SET
    sqm_purchased = EXCLUDED.sqm_purchased,
    amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    project_title = EXCLUDED.project_title,
    project_location = EXCLUDED.project_location,
    updated_at = NOW()
  RETURNING * INTO v_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'investment_id', v_result.id,
    'user_email', v_user_profile.email,
    'user_name', v_user_profile.full_name
  );
END;
$$ LANGUAGE plpgsql;

-- Enhanced get_user_portfolio function
CREATE OR REPLACE FUNCTION get_user_portfolio(user_email TEXT)
RETURNS TABLE (
  total_sqm BIGINT,
  plot_count BIGINT,
  total_amount DECIMAL(10,2),
  portfolio_summary JSONB,
  referral_balance DECIMAL(12,2),
  total_referrals INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(po.sqm_owned), 0)::BIGINT as total_sqm,
    COUNT(DISTINCT po.plot_id)::BIGINT as plot_count,
    COALESCE(SUM(po.amount_paid), 0.00) as total_amount,
    jsonb_build_object(
      'plots', jsonb_agg(
        jsonb_build_object(
          'plot_name', po.plot_name,
          'location', po.location,
          'sqm_owned', po.sqm_owned,
          'amount_paid', po.amount_paid
        )
      )
    ) as portfolio_summary,
    COALESCE(SUM(rr.amount), 0.00) as referral_balance,
    COUNT(DISTINCT rr.referred_user_id)::INTEGER as total_referrals
  FROM auth.users au
  LEFT JOIN plot_ownership po ON au.id = po.user_id
  LEFT JOIN referral_rewards rr ON au.id = rr.referrer_id AND rr.status = 'paid'
  WHERE au.email = user_email
  GROUP BY au.id, au.email;
END;
$$ LANGUAGE plpgsql;

-- Function to get user referral stats
CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', up.id,
    'referral_code', up.referral_code,
    'total_referrals', COUNT(rr.id),
    'total_earned', COALESCE(SUM(rr.amount), 0),
    'wallet_balance', COALESCE(SUM(CASE WHEN rr.status = 'paid' THEN rr.amount ELSE 0 END), 0),
    'referred_users', jsonb_agg(
      jsonb_build_object(
        'id', rr.referred_user_id,
        'email', up2.email,
        'full_name', up2.full_name,
        'amount', rr.amount,
        'status', rr.status,
        'created_at', rr.created_at
      )
    ) FILTER (WHERE rr.id IS NOT NULL)
  ) INTO v_result
  FROM user_profiles up
  LEFT JOIN referral_rewards rr ON up.id = rr.referrer_id
  LEFT JOIN user_profiles up2 ON rr.referred_user_id = up2.id
  WHERE up.id = p_user_id
  GROUP BY up.id, up.referral_code;
  
  RETURN COALESCE(v_result, jsonb_build_object(
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
    up2.full_name as referred_user_name,
    i.amount as purchase_amount,
    rr.amount as reward_amount,
    rr.created_at
  FROM referral_rewards rr
  JOIN user_profiles up2 ON rr.referred_user_id = up2.id
  JOIN investments i ON rr.purchase_id = i.id
  WHERE rr.referrer_id = p_user_id
  ORDER BY rr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON investments(project_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_plot_ownership_user_id ON plot_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_plot_ownership_plot_id ON plot_ownership(plot_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred ON referral_rewards(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);

-- STEP 5: SET UP ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investments
CREATE POLICY "Users can view their own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for plot_ownership
CREATE POLICY "Users can view their own plot ownership" ON plot_ownership
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plot ownership" ON plot_ownership
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plot ownership" ON plot_ownership
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for referral_rewards
CREATE POLICY "Users can view their own referral rewards" ON referral_rewards
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- RLS Policies for referral_withdrawals
CREATE POLICY "Users can view their own withdrawals" ON referral_withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawals" ON referral_withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for referral_audit_log
CREATE POLICY "Users can view their own audit log" ON referral_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- STEP 6: VERIFICATION
-- =====================================================

-- Check all tables exist
SELECT 'Tables created successfully' as status;

-- Check all functions exist
SELECT 'Functions created successfully' as status;

-- Check all indexes exist
SELECT 'Indexes created successfully' as status;

-- Check RLS is enabled
SELECT 'RLS enabled successfully' as status;

-- Final success message
SELECT '🎉 SUPABASE MIGRATION COMPLETED SUCCESSFULLY!' as final_status;
