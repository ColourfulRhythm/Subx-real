-- Populate Missing Data for Subx Application
-- Run this in your Supabase SQL Editor after the main schema

-- First, let's check what users exist in auth.users
-- SELECT id, email, created_at FROM auth.users LIMIT 10;

-- Insert user profiles for existing users (replace with actual user IDs from your auth.users table)
-- You'll need to get the actual user IDs from your Supabase auth.users table

-- Example: Insert user profiles (replace the UUIDs with actual user IDs)
INSERT INTO user_profiles (id, full_name, phone, created_at) VALUES
-- Christopher Onuoha
('f82096a8-90fe-49f7-b22e-4bdbaaf43c31', 'Christopher Onuoha', '+234 801 234 5678', NOW()),
-- Add more users as needed
('00000000-0000-0000-0000-000000000001', 'Kingkwa Enang Oyama', '+234 802 345 6789', NOW()),
('00000000-0000-0000-0000-000000000002', 'Iwuozor Chika', '+234 803 456 7890', NOW());

-- Insert investments for existing users
INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at) VALUES
-- Christopher Onuoha - 7 sqm in Plot 77 (Project ID 1)
('f82096a8-90fe-49f7-b22e-4bdbaaf43c31', 1, 7, 35000.00, 'completed', 'CHRIS_ONUOHA_001', NOW()),
-- Kingkwa Enang Oyama - 35 sqm in Plot 77 (Project ID 1)
('00000000-0000-0000-0000-000000000001', 1, 35, 175000.00, 'completed', 'KINGKWA_OYAMA_001', NOW()),
-- Iwuozor Chika - 7 sqm in Plot 77 (Project ID 1)
('00000000-0000-0000-0000-000000000002', 1, 7, 35000.00, 'completed', 'IWUOZOR_CHIKA_001', NOW());

-- Update forum topics to link to real users
UPDATE forum_topics 
SET user_id = 'f82096a8-90fe-49f7-b22e-4bdbaaf43c31' 
WHERE id IN (1, 2, 3, 4, 5);

-- Insert some forum replies
INSERT INTO forum_replies (topic_id, user_id, content, created_at) VALUES
(1, 'f82096a8-90fe-49f7-b22e-4bdbaaf43c31', 'Welcome everyone! Great to be part of this community.', NOW()),
(1, '00000000-0000-0000-0000-000000000001', 'Thanks for the warm welcome! Looking forward to learning from everyone.', NOW()),
(2, 'f82096a8-90fe-49f7-b22e-4bdbaaf43c31', 'Start with smaller investments and gradually increase as you learn.', NOW()),
(3, '00000000-0000-0000-0000-000000000001', 'I think emerging markets in Ogun State show great potential.', NOW());

-- Verify the data
SELECT 'User Profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'Investments' as table_name, COUNT(*) as count FROM investments
UNION ALL
SELECT 'Forum Topics' as table_name, COUNT(*) as count FROM forum_topics
UNION ALL
SELECT 'Forum Replies' as table_name, COUNT(*) as count FROM forum_replies;
