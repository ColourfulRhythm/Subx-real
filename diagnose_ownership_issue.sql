-- DIAGNOSE OWNERSHIP ISSUE - Find out what's wrong
-- This will help us understand why portfolios are showing 0

-- Step 1: Check if plot_ownership table exists and has data
SELECT 
  'Table Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plot_ownership') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as table_exists,
  CASE 
    WHEN EXISTS (SELECT 1 FROM plot_ownership) 
    THEN (SELECT COUNT(*) FROM plot_ownership)::TEXT 
    ELSE '0' 
  END as record_count;

-- Step 2: Check if projects table has the right data
SELECT 
  'Projects Status' as check_type,
  p.id,
  p.title,
  p.total_sqm,
  p.status
FROM projects p
WHERE p.title LIKE '%Plot 77%' OR p.title LIKE '%2 Seasons%';

-- Step 3: Check if users exist
SELECT 
  'Users Status' as check_type,
  au.id,
  au.email,
  au.created_at
FROM auth.users au
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com');

-- Step 4: Check if user_profiles exist
SELECT 
  'User Profiles Status' as check_type,
  up.id,
  up.referral_code,
  up.wallet_balance
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com');

-- Step 5: Check current plot_ownership data (if any)
SELECT 
  'Current Ownership Data' as check_type,
  po.id,
  po.user_id,
  po.plot_id,
  po.sqm_owned,
  po.amount_paid,
  po.plot_name,
  au.email
FROM plot_ownership po
LEFT JOIN auth.users au ON po.user_id = au.id
LIMIT 10;

-- Step 6: Check if the INSERT would work (dry run)
SELECT 
  'INSERT Test' as check_type,
  au.email,
  p.id as project_id,
  p.title as project_title,
  CASE 
    WHEN au.email = 'kingflamebeats@gmail.com' THEN 1
    WHEN au.email = 'chrixonuoha@gmail.com' THEN 7
    WHEN au.email = 'kingkwaoyama@gmail.com' THEN 35
    WHEN au.email = 'mary.stella82@yahoo.com' THEN 7
  END as sqm_to_insert,
  CASE 
    WHEN au.email = 'kingflamebeats@gmail.com' THEN 5000.00
    WHEN au.email = 'chrixonuoha@gmail.com' THEN 35000.00
    WHEN au.email = 'kingkwaoyama@gmail.com' THEN 175000.00
    WHEN au.email = 'mary.stella82@yahoo.com' THEN 35000.00
  END as amount_to_insert
FROM auth.users au
CROSS JOIN projects p
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com')
  AND p.title LIKE '%Plot 77%' OR p.title LIKE '%2 Seasons%';

-- Step 7: Check what tables exist
SELECT 
  'Available Tables' as check_type,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
