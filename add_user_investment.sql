-- Script to add user's 1 sqm investment if it's missing
-- Run this in your Supabase SQL Editor after running test_user_investments.sql

-- First, let's check if you have a user profile
SELECT '=== CHECKING YOUR USER PROFILE ===' as info;
SELECT 
    up.id,
    up.full_name,
    up.phone,
    up.created_at,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'your-email@example.com'; -- Replace with your actual email

-- If you don't have a user profile, create one
-- Replace 'your-email@example.com' with your actual email
INSERT INTO user_profiles (id, full_name, phone, created_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Your Name'),
    COALESCE(au.raw_user_meta_data->>'phone', '+234 800 000 0000'),
    au.created_at
FROM auth.users au
WHERE au.email = 'your-email@example.com' -- Replace with your actual email
ON CONFLICT (id) DO NOTHING;

-- Now check if you have an investment for Plot 77
SELECT '=== CHECKING YOUR INVESTMENT FOR PLOT 77 ===' as info;
SELECT 
    i.id,
    i.user_id,
    i.project_id,
    i.sqm_purchased,
    i.amount,
    i.status,
    i.created_at
FROM investments i
JOIN user_profiles up ON i.user_id = up.id
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'your-email@example.com' -- Replace with your actual email
AND i.project_id = 1;

-- If you don't have an investment, create one
-- Replace 'your-email@example.com' with your actual email
INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at)
SELECT 
    up.id,
    1, -- Plot 77
    1, -- 1 sqm
    5000.00, -- Amount for 1 sqm
    'completed',
    'MANUAL_ADD_001',
    NOW()
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'your-email@example.com' -- Replace with your actual email
AND NOT EXISTS (
    SELECT 1 FROM investments i 
    WHERE i.user_id = up.id AND i.project_id = 1
);

-- Verify the investment was created
SELECT '=== VERIFYING INVESTMENT CREATION ===' as info;
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
JOIN user_profiles up ON i.user_id = up.id
JOIN auth.users au ON up.id = au.id
WHERE au.email = 'your-email@example.com' -- Replace with your actual email
AND i.project_id = 1;

-- Test the co-owners function again
SELECT '=== TESTING CO-OWNERS FUNCTION AFTER ADDING INVESTMENT ===' as info;
SELECT * FROM get_plot77_with_placeholders();

-- Show updated available SQM for Plot 77
SELECT '=== UPDATED AVAILABLE SQM FOR PLOT 77 ===' as info;
SELECT 
    p.title,
    p.total_sqm as total_sqm,
    COALESCE(SUM(i.sqm_purchased), 0) as purchased_sqm,
    (p.total_sqm - COALESCE(SUM(i.sqm_purchased), 0)) as available_sqm
FROM projects p
LEFT JOIN investments i ON p.id = i.project_id AND i.status = 'completed'
WHERE p.id = 1
GROUP BY p.id, p.title, p.total_sqm;
