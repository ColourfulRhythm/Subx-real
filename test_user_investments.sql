-- Test script to check user investments and fix any issues
-- Run this in your Supabase SQL Editor

-- Check if the user_profiles table exists and has data
SELECT '=== CHECKING USER_PROFILES TABLE ===' as info;
SELECT COUNT(*) as total_users FROM user_profiles;

-- Check if the investments table exists and has data
SELECT '=== CHECKING INVESTMENTS TABLE ===' as info;
SELECT COUNT(*) as total_investments FROM investments;

-- Check if the projects table exists and has data
SELECT '=== CHECKING PROJECTS TABLE ===' as info;
SELECT COUNT(*) as total_projects FROM projects;

-- Check all investments for Plot 77 (Project ID 1)
SELECT '=== CHECKING ALL INVESTMENTS FOR PLOT 77 ===' as info;
SELECT 
    i.id,
    i.user_id,
    i.project_id,
    i.sqm_purchased,
    i.amount,
    i.status,
    i.created_at,
    up.full_name,
    au.email
FROM investments i
LEFT JOIN user_profiles up ON i.user_id = up.id
LEFT JOIN auth.users au ON i.user_id = au.id
WHERE i.project_id = 1
ORDER BY i.created_at DESC;

-- Check if there are any investments without user_profiles
SELECT '=== CHECKING INVESTMENTS WITHOUT USER PROFILES ===' as info;
SELECT 
    i.id,
    i.user_id,
    i.project_id,
    i.sqm_purchased,
    i.amount,
    i.status
FROM investments i
LEFT JOIN user_profiles up ON i.user_id = up.id
WHERE up.id IS NULL;

-- Check the current user authentication
SELECT '=== CHECKING AUTH.USERS ===' as info;
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Show sample auth.users data
SELECT '=== SAMPLE AUTH.USERS DATA ===' as info;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Show the structure of investments table
SELECT '=== INVESTMENTS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investments' 
ORDER BY ordinal_position;

-- Show the structure of user_profiles table
SELECT '=== USER_PROFILES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Check if the functions exist
SELECT '=== CHECKING IF FUNCTIONS EXIST ===' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name IN ('get_plot77_with_placeholders', 'get_plot_co_owners_dynamic');

-- Test the Plot 77 function
SELECT '=== TESTING PLOT 77 FUNCTION ===' as info;
SELECT * FROM get_plot77_with_placeholders();

-- Test the dynamic function for Plot 77
SELECT '=== TESTING DYNAMIC FUNCTION FOR PLOT 77 ===' as info;
SELECT * FROM get_plot_co_owners_dynamic(1);

-- Check for any orphaned investments (investments without valid project_id)
SELECT '=== CHECKING FOR ORPHANED INVESTMENTS ===' as info;
SELECT 
    i.id,
    i.project_id,
    i.user_id,
    i.sqm_purchased,
    i.amount
FROM investments i
LEFT JOIN projects p ON i.project_id = p.id
WHERE p.id IS NULL;

-- Check for any investments without valid user_id
SELECT '=== CHECKING INVESTMENTS WITHOUT VALID USER_ID ===' as info;
SELECT 
    i.id,
    i.user_id,
    i.project_id,
    i.sqm_purchased,
    i.amount
FROM investments i
LEFT JOIN auth.users au ON i.user_id = au.id
WHERE au.id IS NULL;

-- Summary of what we found
SELECT '=== SUMMARY ===' as info;
SELECT 
    'Total Users' as metric,
    COUNT(*) as count
FROM user_profiles
UNION ALL
SELECT 
    'Total Investments' as metric,
    COUNT(*) as count
FROM investments
UNION ALL
SELECT 
    'Total Projects' as metric,
    COUNT(*) as count
FROM projects
UNION ALL
SELECT 
    'Plot 77 Investments' as metric,
    COUNT(*) as count
FROM investments
WHERE project_id = 1;
