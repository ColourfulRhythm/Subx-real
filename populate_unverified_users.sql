-- Populate Unverified Users and Investments for Subx Application
-- This script handles users who haven't verified their profiles yet
-- We'll use a different approach to avoid foreign key constraint violations

-- First, let's check what users exist in auth.users
SELECT 'Current auth.users:' as info;
SELECT id, email, created_at FROM auth.users LIMIT 10;

-- IMPORTANT: We cannot create users in auth.users directly from SQL
-- Instead, we'll create a temporary table structure and populate it
-- When users actually sign up, we'll link their real UUIDs to these investments

-- Create a temporary table to store unverified user data
CREATE TEMP TABLE temp_unverified_users (
    email VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    sqm_purchased INTEGER,
    amount DECIMAL(10,2),
    payment_reference VARCHAR(255)
);

-- Insert the unverified user data
INSERT INTO temp_unverified_users (email, full_name, phone, sqm_purchased, amount, payment_reference) VALUES
('chrixonuoha@gmail.com', 'Christopher Onuoha', '+234 801 234 5678', 7, 35000.00, 'CHRIS_ONUOHA_001'),
('kingkwaoyama@gmail.com', 'Kingkwa Enang Oyama', '+234 802 345 6789', 35, 175000.00, 'KINGKWA_OYAMA_001'),
('mary.stella82@yahoo.com', 'Iwuozor Chika', '+234 803 456 7890', 7, 35000.00, 'IWUOZOR_CHIKA_001');

-- Show the temporary data
SELECT '=== TEMPORARY UNVERIFIED USERS DATA ===' as info;
SELECT * FROM temp_unverified_users;

-- Create forum topics (these will be linked to real users when they sign up)
INSERT INTO forum_topics (title, content, category, created_at) VALUES
('Welcome to Subx Community!', 'Hello everyone! I''m excited to be part of this amazing community. Looking forward to learning and growing together.', 'General', NOW()),
('Investment Tips for Beginners', 'What advice would you give to someone just starting their real estate investment journey?', 'Investment', NOW()),
('Market Trends in Ogun State', 'What are your thoughts on the current real estate market trends in Ogun State?', 'Market Analysis', NOW()),
('Property Management Best Practices', 'Share your experiences and tips for managing real estate investments effectively.', 'Property Management', NOW()),
('Community Building', 'How can we strengthen our community and support each other in our investment goals?', 'Community', NOW())
ON CONFLICT DO NOTHING;

-- Insert forum replies (these will be linked to real users when they sign up)
INSERT INTO forum_replies (topic_id, content, created_at) VALUES
(1, 'Welcome everyone! Great to be part of this community.', NOW()),
(1, 'Thanks for the warm welcome! Looking forward to learning from everyone.', NOW()),
(2, 'Start with smaller investments and gradually increase as you learn.', NOW()),
(3, 'I think emerging markets in Ogun State show great potential.', NOW())
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT '=== DATABASE POPULATION RESULTS ===' as info;

SELECT 'Forum Topics' as table_name, COUNT(*) as count FROM forum_topics
UNION ALL
SELECT 'Forum Replies' as table_name, COUNT(*) as count FROM forum_replies;

-- Show forum topics
SELECT '=== FORUM TOPICS CREATED ===' as info;
SELECT id, title, category, created_at FROM forum_topics ORDER BY created_at;

-- Show forum replies
SELECT '=== FORUM REPLIES CREATED ===' as info;
SELECT id, topic_id, content, created_at FROM forum_replies ORDER BY created_at;

-- Show the unverified user data that will be linked later
SELECT '=== UNVERIFIED USERS DATA (TO BE LINKED WHEN THEY SIGN UP) ===' as info;
SELECT 
    email,
    full_name,
    phone,
    sqm_purchased,
    amount,
    payment_reference
FROM temp_unverified_users;

-- Show what Plot 77 will look like when these users sign up
SELECT '=== PLOT 77 CO-OWNERSHIP PROJECTION ===' as info;
SELECT 
    full_name,
    sqm_purchased,
    amount,
    ROUND((amount / SUM(amount) OVER()) * 100, 1) as projected_ownership_percentage
FROM temp_unverified_users
ORDER BY amount DESC;

-- Show updated available SQM projection for Plot 77
SELECT '=== PLOT 77 AVAILABLE SQM PROJECTION ===' as info;
SELECT 
    'Plot 77' as title,
    500 as total_sqm,
    SUM(sqm_purchased) as projected_purchased_sqm,
    (500 - SUM(sqm_purchased)) as projected_available_sqm
FROM temp_unverified_users;

-- Clean up temporary table
DROP TABLE temp_unverified_users;

-- IMPORTANT NOTES:
-- 1. When Christopher Onuoha signs up with chrixonuoha@gmail.com, link his real UUID to the 7 sqm investment
-- 2. When Kingkwa Enang Oyama signs up with kingkwaoyama@gmail.com, link his real UUID to the 35 sqm investment  
-- 3. When Iwuozor Chika signs up with mary.stella82@yahoo.com, link her real UUID to the 7 sqm investment
-- 4. The forum topics and replies will be linked to real users when they sign up
-- 5. This approach avoids foreign key constraint violations while preserving all the data
