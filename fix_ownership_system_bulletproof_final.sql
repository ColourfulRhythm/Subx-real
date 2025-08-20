-- FIX OWNERSHIP SYSTEM - BULLETPROOF FINAL VERSION
-- This will completely clear ALL data and insert the correct amounts exactly once

-- Step 1: Drop dependent views first
DROP VIEW IF EXISTS user_portfolio_view CASCADE;
DROP VIEW IF EXISTS admin_dashboard_view CASCADE;

-- Step 2: COMPLETELY CLEAR ALL plot_ownership data
TRUNCATE TABLE plot_ownership RESTART IDENTITY CASCADE;

-- Step 3: Create proper ownership table (fresh start)
DROP TABLE IF EXISTS plot_ownership CASCADE;
CREATE TABLE plot_ownership (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plot_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sqm_owned INTEGER NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  plot_name VARCHAR(255),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Find the correct project ID first
DO $$
DECLARE
  project_id INTEGER;
BEGIN
  -- Get the project ID for 2 Seasons Plot 77
  SELECT p.id INTO project_id
  FROM projects p
  WHERE p.title ILIKE '%plot 77%' 
     OR p.title ILIKE '%2 seasons%'
     OR p.title ILIKE '%seasons%'
     OR p.title ILIKE '%gbako%'
     OR p.title ILIKE '%ogun%'
  LIMIT 1;
  
  -- If no project found, create a default one
  IF project_id IS NULL THEN
    INSERT INTO projects (title, location, price_per_sqm, total_sqm, status)
    VALUES ('2 Seasons - Plot 77', '2 Seasons, Gbako Village, Ogun State', 5000, 1000, 'Available')
    RETURNING id INTO project_id;
  END IF;
  
  -- Now insert the correct ownership data
  INSERT INTO plot_ownership (user_id, plot_id, sqm_owned, amount_paid, plot_name, location)
  SELECT 
    au.id,
    project_id,
    CASE 
      WHEN au.email = 'kingflamebeats@gmail.com' THEN 1
      WHEN au.email = 'chrixonuoha@gmail.com' THEN 7
      WHEN au.email = 'kingkwaoyama@gmail.com' THEN 35
      WHEN au.email = 'mary.stella82@yahoo.com' THEN 7
      WHEN au.email LIKE '%tolulope%' THEN 1
      ELSE 0
    END as sqm_owned,
    CASE 
      WHEN au.email = 'kingflamebeats@gmail.com' THEN 5000.00
      WHEN au.email = 'chrixonuoha@gmail.com' THEN 35000.00
      WHEN au.email = 'kingkwaoyama@gmail.com' THEN 175000.00
      WHEN au.email = 'mary.stella82@yahoo.com' THEN 35000.00
      WHEN au.email LIKE '%tolulope%' THEN 5000.00
      ELSE 0.00
    END as amount_paid,
    '2 Seasons - Plot 77',
    '2 Seasons, Gbako Village, Ogun State'
  FROM auth.users au
  WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com')
     OR au.email LIKE '%tolulope%';
END $$;

-- Step 4: Create a simple portfolio function
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

-- Step 5: Create a simple portfolio view
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

-- Step 6: Verify EXACTLY what was inserted
SELECT 
  'EXACT DATA INSERTED' as check_type,
  au.email,
  po.sqm_owned,
  po.amount_paid,
  po.plot_name,
  po.plot_id,
  p.title as project_title
FROM plot_ownership po
JOIN auth.users au ON po.user_id = au.id
JOIN projects p ON po.plot_id = p.id
ORDER BY au.email;

-- Step 7: Show total portfolio summary for all users
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
  get_user_portfolio('mary.stella82@yahoo.com')
UNION ALL
SELECT 
  'Portfolio Summary - tolulope' as check_type,
  get_user_portfolio((SELECT email FROM auth.users WHERE email LIKE '%tolulope%' LIMIT 1));

-- Step 8: Show total system summary
SELECT 
  'SYSTEM SUMMARY' as check_type,
  COUNT(DISTINCT po.user_id) as total_users_with_land,
  SUM(po.sqm_owned) as total_land_sold,
  SUM(po.amount_paid) as total_revenue
FROM plot_ownership po;

-- Step 9: Show all users and their portfolio status
SELECT 
  au.email,
  up.referral_code,
  COALESCE(SUM(po.sqm_owned), 0) as total_land_owned,
  COALESCE(SUM(po.amount_paid), 0.00) as total_portfolio_value,
  CASE 
    WHEN SUM(po.sqm_owned) > 0 THEN '✅ HAS LAND'
    ELSE '❌ NO LAND'
  END as portfolio_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN plot_ownership po ON au.id = po.user_id
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com')
   OR au.email LIKE '%tolulope%'
GROUP BY au.id, au.email, up.referral_code
ORDER BY au.email;

-- Step 10: Recreate the admin dashboard view
CREATE OR REPLACE VIEW admin_dashboard_view AS
SELECT 
  'Platform Overview' as section,
  jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_projects', (SELECT COUNT(*) FROM projects),
    'total_ownerships', (SELECT COUNT(*) FROM plot_ownership),
    'total_referral_codes', (SELECT COUNT(*) FROM user_profiles WHERE referral_code IS NOT NULL),
    'pending_verifications', 0, -- Will be calculated by function instead
    'total_portfolio_value', (SELECT COALESCE(SUM(amount_paid), 0.00) FROM plot_ownership)
  ) as data;
