-- FIX PAYMENT SYSTEM - Update finalize_purchase function to work with current schema
-- This fixes the critical issue where payments aren't being processed properly

-- Step 1: Drop the old finalize_purchase function
DROP FUNCTION IF EXISTS finalize_purchase(TEXT);

-- Step 2: Create the correct finalize_purchase function for our schema
CREATE OR REPLACE FUNCTION finalize_purchase(p_payment_ref TEXT)
RETURNS VOID AS $$
DECLARE
  v_investment RECORD;
  v_project RECORD;
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get investment details from investments table
  SELECT * INTO v_investment FROM investments WHERE payment_reference = p_payment_ref;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Investment not found for payment reference: %', p_payment_ref;
  END IF;
  
  -- Get project details
  SELECT * INTO v_project FROM projects WHERE id = v_investment.project_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found for investment';
  END IF;
  
  -- Get user details for Telegram notification
  SELECT email, full_name INTO v_user_email, v_user_name 
  FROM user_profiles WHERE user_id = v_investment.user_id;
  
  -- Update investment status to successful
  UPDATE investments SET 
    status = 'successful',
    updated_at = NOW()
  WHERE payment_reference = p_payment_ref;
  
  -- Create plot ownership record
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
  
  -- Log the successful purchase
  RAISE NOTICE 'Purchase finalized successfully for user %: % sqm in % for ₦%', 
    v_user_email, v_investment.sqm_purchased, v_project.title, v_investment.amount;
    
END;
$$ LANGUAGE plpgsql;

-- Step 3: Add payment_reference column to investments table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investments' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE investments ADD COLUMN payment_reference TEXT UNIQUE;
  END IF;
END $$;

-- Step 4: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_investments_payment_reference ON investments(payment_reference);

-- Step 5: Create function to sync MongoDB investment to Supabase
CREATE OR REPLACE FUNCTION sync_investment_to_supabase(
  p_user_id UUID,
  p_project_id INTEGER,
  p_sqm_purchased INTEGER,
  p_amount DECIMAL(10,2),
  p_payment_reference TEXT,
  p_project_title TEXT,
  p_location TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update investment in Supabase
  INSERT INTO investments (
    user_id, 
    project_id, 
    sqm_purchased, 
    amount, 
    payment_reference, 
    status, 
    created_at, 
    updated_at
  ) VALUES (
    p_user_id,
    p_project_id,
    p_sqm_purchased,
    p_amount,
    p_payment_reference,
    'pending',
    NOW(),
    NOW()
  )
  ON CONFLICT (payment_reference) DO UPDATE SET
    sqm_purchased = EXCLUDED.sqm_purchased,
    amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    updated_at = NOW();
    
  RAISE NOTICE 'Investment synced to Supabase: % sqm for ₦% with reference %', 
    p_sqm_purchased, p_amount, p_payment_reference;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Drop existing function first, then create new one
DROP FUNCTION IF EXISTS get_user_portfolio(TEXT);

-- Create function to get user portfolio with proper data
CREATE OR REPLACE FUNCTION get_user_portfolio(user_email TEXT)
RETURNS TABLE (
  total_sqm BIGINT,
  plot_count BIGINT,
  total_amount DECIMAL(10,2),
  portfolio_summary JSONB
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
    ) as portfolio_summary
  FROM plot_ownership po
  JOIN auth.users au ON po.user_id = au.id
  WHERE au.email = user_email;
END;
$$ LANGUAGE plpgsql;
