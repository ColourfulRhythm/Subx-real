-- CHECK CURRENT DEPLOYMENT STATUS
-- This will show us what's already been deployed

-- Step 1: Check if plot_ownership table exists and has data
SELECT 
  'Ownership System Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plot_ownership') 
    THEN 'EXISTS' 
    ELSE 'NOT DEPLOYED' 
  END as table_exists,
  CASE 
    WHEN EXISTS (SELECT 1 FROM plot_ownership) 
    THEN (SELECT COUNT(*) FROM plot_ownership)::TEXT 
    ELSE '0' 
  END as record_count;

-- Step 2: Check current ownership data
SELECT 
  'Current Ownership Data' as check_type,
  au.email,
  po.sqm_owned,
  po.amount_paid,
  po.plot_name
FROM auth.users au
LEFT JOIN plot_ownership po ON au.id = po.user_id
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com')
   OR au.email LIKE '%tolulope%'
ORDER BY au.email;

-- Step 3: Check if referral automation functions exist
SELECT 
  'Referral System Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_referral_code') 
    THEN 'DEPLOYED' 
    ELSE 'NOT DEPLOYED' 
  END as generate_referral_code_function,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'set_user_referral_code') 
    THEN 'DEPLOYED' 
    ELSE 'NOT DEPLOYED' 
  END as set_user_referral_code_function;

-- Step 4: Check if admin system functions exist
SELECT 
  'Admin System Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') 
    THEN 'DEPLOYED' 
    ELSE 'NOT DEPLOYED' 
  END as admin_users_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_dashboard_stats') 
    THEN 'DEPLOYED' 
    ELSE 'NOT DEPLOYED' 
  END as admin_dashboard_function,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_admin_users_list') 
    THEN 'DEPLOYED' 
    ELSE 'NOT DEPLOYED' 
  END as admin_users_function;

-- Step 5: Check if user_profiles have referral codes
SELECT 
  'Referral Codes Status' as check_type,
  COUNT(*) as total_users,
  COUNT(CASE WHEN referral_code IS NOT NULL THEN 1 END) as users_with_codes,
  COUNT(CASE WHEN referral_code IS NULL THEN 1 END) as users_without_codes
FROM user_profiles;

-- Step 6: Check admin users
SELECT 
  'Admin Users Status' as check_type,
  au.email,
  adu.role,
  adu.is_active
FROM admin_users adu
JOIN auth.users au ON adu.user_id = au.id;

-- Step 7: Check if views exist
SELECT 
  'Views Status' as check_type,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_portfolio_view', 'admin_dashboard_view')
ORDER BY table_name;
