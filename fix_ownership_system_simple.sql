-- FIX OWNERSHIP SYSTEM - Simple, Clean Version
-- This will restore the user's 1 sqm and set up proper ownership tracking

-- Step 1: Create proper ownership table
CREATE TABLE IF NOT EXISTS plot_ownership (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plot_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sqm_owned INTEGER NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  plot_name VARCHAR(255),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Insert ALL users' land ownership
INSERT INTO plot_ownership (user_id, plot_id, sqm_owned, amount_paid, plot_name, location)
SELECT 
  au.id,
  p.id,
  CASE 
    WHEN au.email = 'kingflamebeats@gmail.com' THEN 1
    WHEN au.email = 'chrixonuoha@gmail.com' THEN 7
    WHEN au.email = 'kingkwaoyama@gmail.com' THEN 35
    WHEN au.email = 'mary.stella82@yahoo.com' THEN 7
  END as sqm_owned,
  CASE 
    WHEN au.email = 'kingflamebeats@gmail.com' THEN 5000.00
    WHEN au.email = 'chrixonuoha@gmail.com' THEN 35000.00
    WHEN au.email = 'kingkwaoyamaoyama@gmail.com' THEN 175000.00
    WHEN au.email = 'mary.stella82@yahoo.com' THEN 35000.00
  END as amount_paid,
  '2 Seasons - Plot 77',
  '2 Seasons, Gbako Village, Ogun State'
FROM auth.users au
CROSS JOIN projects p
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com')
  AND p.title = '2 Seasons - Plot 77'
ON CONFLICT DO NOTHING;

-- Step 3: Create a simple portfolio function
CREATE OR REPLACE FUNCTION get_user_portfolio(user_email TEXT)
RETURNS TABLE(
  total_sqm BIGINT,
  total_value DECIMAL(10,2),
  plot_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(po.sqm_owned), 0) as total_sqm,
    COALESCE(SUM(po.amount_paid), 0.00) as total_value,
    COUNT(po.id) as plot_count
  FROM plot_ownership po
  JOIN auth.users au ON po.user_id = au.id
  WHERE au.email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a simple portfolio view
CREATE OR REPLACE VIEW user_portfolio_view AS
SELECT 
  au.id as user_id,
  au.email,
  up.referral_code,
  up.wallet_balance,
  COALESCE(SUM(po.sqm_owned), 0) as total_land_owned,
  COALESCE(SUM(po.amount_paid), 0.00) as total_portfolio_value
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN plot_ownership po ON au.id = po.user_id
GROUP BY au.id, au.email, up.referral_code, up.wallet_balance;

-- Step 5: Verify ALL users' portfolios are restored
SELECT 
  'User Portfolio Status' as check_type,
  au.email,
  up.referral_code,
  po.plot_name,
  po.sqm_owned,
  po.amount_paid
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN plot_ownership po ON au.id = po.user_id
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com');

-- Step 6: Show total portfolio summary for all users
SELECT 
  'Portfolio Summary - kingflamebeats@gmail.com' as check_type,
  get_user_portfolio('kingflamebeats@gmail.com')
UNION ALL
SELECT 
  'Portfolio Summary - chrixonuoha@gmail.com' as check_type,
  get_user_portfolio('chrixonuoha@gmail.com')
UNION ALL
SELECT 
  'Portfolio Summary - kingkwaoyama@gmail.com' as check_type,
  get_user_portfolio('kingkwaoyama@gmail.com')
UNION ALL
SELECT 
  'Portfolio Summary - mary.stella82@yahoo.com' as check_type,
  get_user_portfolio('mary.stella82@yahoo.com');

-- Step 7: Show all users and their portfolio status
SELECT 
  au.email,
  up.referral_code,
  COALESCE(SUM(po.sqm_owned), 0) as total_land_owned,
  COALESCE(SUM(po.amount_paid), 0.00) as total_portfolio_value
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN plot_ownership po ON au.id = po.user_id
GROUP BY au.id, au.email, up.referral_code
ORDER BY au.email;
