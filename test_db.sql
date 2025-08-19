-- Test script to check database data
-- Run this in Supabase SQL Editor

-- Check if investments exist
SELECT '=== INVESTMENTS DATA ===' as info;
SELECT * FROM investments;

-- Check if user_profiles exist
SELECT '=== USER PROFILES DATA ===' as info;
SELECT * FROM user_profiles;

-- Check if projects exist
SELECT '=== PROJECTS DATA ===' as info;
SELECT * FROM projects;

-- Check total purchased SQM for Plot 77
SELECT '=== PLOT 77 INVESTMENTS ===' as info;
SELECT 
    p.title,
    p.total_sqm,
    COALESCE(SUM(i.sqm_purchased), 0) as purchased_sqm,
    (p.total_sqm - COALESCE(SUM(i.sqm_purchased), 0)) as available_sqm
FROM projects p
LEFT JOIN investments i ON p.id = i.project_id AND i.status = 'completed'
WHERE p.id = 1
GROUP BY p.id, p.title, p.total_sqm;
