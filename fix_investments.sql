-- Fix Investments Data for Subx Application
-- This script properly inserts investment data for existing users

-- First, let's check what we have
SELECT '=== CURRENT STATE ===' as info;
SELECT COUNT(*) as investments_count FROM investments;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;

-- Clear any existing placeholder data to avoid conflicts
DELETE FROM investments WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222', 
  '33333333-3333-3333-3333-333333333333'
);

DELETE FROM user_profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Insert user profiles with proper UUIDs
INSERT INTO user_profiles (id, full_name, phone, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Christopher Onuoha', '+234 801 234 5678', NOW()),
('22222222-2222-2222-2222-222222222222', 'Kingkwa Enang Oyama', '+234 802 345 6789', NOW()),
('33333333-3333-3333-3333-333333333333', 'Iwuozor Chika', '+234 803 456 7890', NOW())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- Insert investments with proper data
INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 1, 7, 35000.00, 'completed', 'CHRIS_ONUOHA_001', NOW()),
('22222222-2222-2222-2222-222222222222', 1, 35, 175000.00, 'completed', 'KINGKWA_OYAMA_001', NOW()),
('33333333-3333-3333-3333-333333333333', 1, 7, 35000.00, 'completed', 'IWUOZOR_CHIKA_001', NOW())
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT '=== VERIFICATION ===' as info;

-- Check investments
SELECT 'Investments:' as table_name, COUNT(*) as count FROM investments
UNION ALL
SELECT 'User Profiles:' as table_name, COUNT(*) as count FROM user_profiles;

-- Show investment details
SELECT 
    i.id,
    up.full_name,
    i.sqm_purchased,
    i.amount,
    i.status,
    p.title as project_title
FROM investments i
JOIN user_profiles up ON i.user_id = up.id
JOIN projects p ON i.project_id = p.id;

-- Show co-ownership data for Plot 77
SELECT '=== CO-OWNERSHIP DATA FOR PLOT 77 ===' as info;
SELECT 
    up.full_name,
    i.sqm_purchased,
    i.amount,
    ROUND((i.amount / SUM(i.amount) OVER()) * 100, 1) as ownership_percentage
FROM investments i
JOIN user_profiles up ON i.user_id = up.id
WHERE i.project_id = 1 AND i.status = 'completed'
ORDER BY i.amount DESC;

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
