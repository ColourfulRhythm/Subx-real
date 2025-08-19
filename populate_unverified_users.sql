-- Populate Unverified Users and Investments for Subx Application
-- This script handles users who haven't verified their profiles yet

-- First, let's check what users exist in auth.users
SELECT 'Current auth.users:' as info;
SELECT id, email, created_at FROM auth.users LIMIT 10;

-- Create placeholder user profiles for unverified users
-- These will be updated when users actually sign up and verify
INSERT INTO user_profiles (id, full_name, phone, created_at) VALUES
-- Christopher Onuoha (placeholder UUID - will be updated when verified)
('11111111-1111-1111-1111-111111111111', 'Christopher Onuoha', '+234 801 234 5678', NOW()),
-- Kingkwa Enang Oyama (placeholder UUID - will be updated when verified)
('22222222-2222-2222-2222-222222222222', 'Kingkwa Enang Oyama', '+234 802 345 6789', NOW()),
-- Iwuozor Chika (placeholder UUID - will be updated when verified)
('33333333-3333-3333-3333-333333333333', 'Iwuozor Chika', '+234 803 456 7890', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert investments for existing users (using placeholder UUIDs)
INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at) VALUES
-- Christopher Onuoha - 7 sqm in Plot 77 (Project ID 1)
('11111111-1111-1111-1111-111111111111', 1, 7, 35000.00, 'completed', 'CHRIS_ONUOHA_001', NOW()),
-- Kingkwa Enang Oyama - 35 sqm in Plot 77 (Project ID 1)
('22222222-2222-2222-2222-222222222222', 1, 35, 175000.00, 'completed', 'KINGKWA_OYAMA_001', NOW()),
-- Iwuozor Chika - 7 sqm in Plot 77 (Project ID 1)
('33333333-3333-3333-3333-333333333333', 1, 7, 35000.00, 'completed', 'IWUOZOR_CHIKA_001', NOW())
ON CONFLICT DO NOTHING;

-- Update forum topics to link to placeholder users
UPDATE forum_topics 
SET user_id = '11111111-1111-1111-1111-111111111111' 
WHERE id IN (1, 2, 3, 4, 5) AND user_id IS NULL;

-- Insert forum replies
INSERT INTO forum_replies (topic_id, user_id, content, created_at) VALUES
(1, '11111111-1111-1111-1111-111111111111', 'Welcome everyone! Great to be part of this community.', NOW()),
(1, '22222222-2222-2222-2222-222222222222', 'Thanks for the warm welcome! Looking forward to learning from everyone.', NOW()),
(2, '11111111-1111-1111-1111-111111111111', 'Start with smaller investments and gradually increase as you learn.', NOW()),
(3, '22222222-2222-2222-2222-222222222222', 'I think emerging markets in Ogun State show great potential.', NOW())
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT '=== DATABASE POPULATION RESULTS ===' as info;

SELECT 'User Profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'Investments' as table_name, COUNT(*) as count FROM investments
UNION ALL
SELECT 'Forum Topics' as table_name, COUNT(*) as count FROM forum_topics
UNION ALL
SELECT 'Forum Replies' as table_name, COUNT(*) as count FROM forum_replies;

-- Show investment details
SELECT '=== INVESTMENT DETAILS ===' as info;
SELECT 
    i.id,
    up.full_name,
    i.sqm_purchased,
    i.amount,
    i.status,
    i.payment_reference,
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
