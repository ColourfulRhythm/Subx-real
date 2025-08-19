-- BETTER Cleanup script that preserves existing investments
-- Run this in your Supabase SQL Editor to clean up the database safely

-- First, let's see what's currently in the database
SELECT '=== CURRENT DATABASE STATE (BEFORE CLEANUP) ===' as info;

SELECT 'Current Projects:' as status;
SELECT id, title, description, total_sqm FROM projects ORDER BY id;

SELECT 'Current Investments:' as status;
SELECT 
    i.id,
    i.project_id,
    i.sqm_purchased,
    i.amount,
    i.status,
    p.title as project_title
FROM investments i
LEFT JOIN projects p ON i.project_id = p.id
ORDER BY i.project_id, i.created_at;

-- Step 1: Remove only the unwanted sample projects (Kobape Gardens and Victoria Island)
DELETE FROM projects WHERE title IN (
    'Kobape Gardens - Phase 1',
    'Victoria Island Luxury Apartments'
);

-- Step 2: Remove any investments for the deleted projects (should be 0)
DELETE FROM investments WHERE project_id NOT IN (SELECT id FROM projects);

-- Step 3: Update existing projects to match our corrected schema
-- Update Plot 77 (ID 1) if it exists
UPDATE projects SET 
    title = '2 Seasons - Plot 77',
    description = 'Premium residential plot in 2 Seasons Estate',
    total_sqm = 500,
    price_per_sqm = 5000.00,
    amenities = ARRAY['Road access', 'Security', 'Drainage'],
    image_urls = ARRAY['/2-seasons/2seasons-logo.jpg']
WHERE id = 1;

-- Insert missing plots if they don't exist
INSERT INTO projects (title, description, location, total_sqm, price_per_sqm, amenities, image_urls) VALUES
('2 Seasons - Plot 79', 'Exclusive residential plot with lakefront views', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Lakefront'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 81', 'Premium plot in the wellness village with spa access', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Wellness center', 'Spa access'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 84', 'Family-oriented plot near community facilities', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Community center', 'Playground'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 87', 'Executive plot with premium amenities', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Executive lounge', 'Premium parking'], ARRAY['/2-seasons/2seasons-logo.jpg'])
ON CONFLICT (title) DO NOTHING;

-- Step 4: Ensure we have the required investments for Plot 77
-- First, check if we need to create placeholder user profiles
INSERT INTO user_profiles (id, full_name, phone, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Christopher Onuoha', '+234 801 234 5678', NOW()),
('00000000-0000-0000-0000-000000000002', 'Kingkwa Enang Oyama', '+234 802 345 6789', NOW()),
('00000000-0000-0000-0000-000000000003', 'Iwuozor Chika', '+234 803 456 7890', NOW())
ON CONFLICT (id) DO NOTHING;

-- Now ensure we have the investments for Plot 77
INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at) VALUES
-- Christopher Onuoha - 7 sqm in Plot 77
('00000000-0000-0000-0000-000000000001', 1, 7, 35000.00, 'completed', 'CHRIS_ONUOHA_001', NOW()),
-- Kingkwa Enang Oyama - 35 sqm in Plot 77  
('00000000-0000-0000-0000-000000000002', 1, 35, 175000.00, 'completed', 'KINGKWA_OYAMA_001', NOW()),
-- Iwuozor Chika - 7 sqm in Plot 77
('00000000-0000-0000-0000-000000000003', 1, 7, 35000.00, 'completed', 'IWUOZOR_CHIKA_001', NOW())
ON CONFLICT DO NOTHING;

-- Step 5: Clean up forum data (remove orphaned topics and replies)
DELETE FROM forum_topics WHERE user_id NOT IN (SELECT id FROM user_profiles);
DELETE FROM forum_replies WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Step 6: Verify the final state
SELECT '=== FINAL DATABASE STATE (AFTER CLEANUP) ===' as info;

SELECT 'Real Plots Only:' as status;
SELECT id, title, total_sqm, price_per_sqm FROM projects ORDER BY id;

SELECT 'Plot 77 Investments:' as status;
SELECT 
    i.id,
    i.sqm_purchased,
    i.amount,
    i.status,
    up.full_name
FROM investments i
JOIN user_profiles up ON i.user_id = up.id
WHERE i.project_id = 1
ORDER BY i.amount DESC;

SELECT 'Available SQM for Plot 77:' as status;
SELECT 
    p.title,
    p.total_sqm as total_sqm,
    COALESCE(SUM(i.sqm_purchased), 0) as purchased_sqm,
    (p.total_sqm - COALESCE(SUM(i.sqm_purchased), 0)) as available_sqm
FROM projects p
LEFT JOIN investments i ON p.id = i.project_id AND i.status = 'completed'
WHERE p.id = 1
GROUP BY p.id, p.title, p.total_sqm;

SELECT 'Total Summary:' as metric, COUNT(*) as count FROM projects
UNION ALL
SELECT 'Total Investments:' as metric, COUNT(*) as count FROM investments
UNION ALL
SELECT 'Total Forum Topics:' as metric, COUNT(*) as count FROM forum_topics
UNION ALL
SELECT 'Total Forum Replies:' as metric, COUNT(*) as count FROM forum_replies;

-- Show co-ownership breakdown for Plot 77
SELECT '=== PLOT 77 CO-OWNERSHIP BREAKDOWN ===' as info;
SELECT 
    up.full_name,
    i.sqm_purchased,
    i.amount,
    ROUND((i.sqm_purchased::DECIMAL / 500::DECIMAL) * 100, 1) as ownership_percentage
FROM investments i
JOIN user_profiles up ON i.user_id = up.id
WHERE i.project_id = 1 AND i.status = 'completed'
ORDER BY i.amount DESC;
