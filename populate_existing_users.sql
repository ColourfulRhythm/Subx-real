-- Populate Existing Users and Investments for Subx Application
-- Run this in your Supabase SQL Editor

-- First, let's check what users exist in auth.users
SELECT 'Current auth.users:' as info;
SELECT id, email, created_at FROM auth.users LIMIT 10;

-- Insert user profiles for existing users
-- Note: Replace the UUIDs with actual user IDs from your auth.users table
-- You can get these by running: SELECT id, email FROM auth.users WHERE email IN ('chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com');

INSERT INTO user_profiles (id, full_name, phone, created_at) VALUES
-- Christopher Onuoha (replace with actual user ID)
('f82096a8-90fe-49f7-b22e-4bdbaaf43c31', 'Christopher Onuoha', '+234 801 234 5678', NOW()),
-- Kingkwa Enang Oyama (replace with actual user ID)
('00000000-0000-0000-0000-000000000001', 'Kingkwa Enang Oyama', '+234 802 345 6789', NOW()),
-- Iwuozor Chika (replace with actual user ID)
('00000000-0000-0000-0000-000000000002', 'Iwuozor Chika', '+234 803 456 7890', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert investments for existing users
INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at) VALUES
-- Christopher Onuoha - 7 sqm in Plot 77 (Project ID 1)
('f82096a8-90fe-49f7-b22e-4bdbaaf43c31', 1, 7, 35000.00, 'completed', 'CHRIS_ONUOHA_001', NOW()),
-- Kingkwa Enang Oyama - 35 sqm in Plot 77 (Project ID 1)
('00000000-0000-0000-0000-000000000001', 1, 35, 175000.00, 'completed', 'KINGKWA_OYAMA_001', NOW()),
-- Iwuozor Chika - 7 sqm in Plot 77 (Project ID 1)
('00000000-0000-0000-0000-000000000002', 1, 7, 35000.00, 'completed', 'IWUOZOR_CHIKA_001', NOW())
ON CONFLICT DO NOTHING;

-- Update forum topics to link to real users
UPDATE forum_topics 
SET user_id = 'f82096a8-90fe-49f7-b22e-4bdbaaf43c31' 
WHERE id IN (1, 2, 3, 4, 5) AND user_id IS NULL;

-- Insert forum replies
INSERT INTO forum_replies (topic_id, user_id, content, created_at) VALUES
(1, 'f82096a8-90fe-49f7-b22e-4bdbaaf43c31', 'Welcome everyone! Great to be part of this community.', NOW()),
(1, '00000000-0000-0000-0000-000000000001', 'Thanks for the warm welcome! Looking forward to learning from everyone.', NOW()),
(2, 'f82096a8-90fe-49f7-b22e-4bdbaaf43c31', 'Start with smaller investments and gradually increase as you learn.', NOW()),
(3, '00000000-0000-0000-0000-000000000001', 'I think emerging markets in Ogun State show great potential.', NOW())
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
