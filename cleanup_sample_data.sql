-- Cleanup script to remove unwanted sample data
-- Run this in your Supabase SQL Editor to clean up the database

-- First, let's see what's currently in the projects table
SELECT '=== CURRENT PROJECTS (BEFORE CLEANUP) ===' as info;
SELECT id, title, description, total_sqm FROM projects ORDER BY id;

-- Remove the unwanted sample projects
DELETE FROM projects WHERE title IN (
    'Kobape Gardens - Phase 1',
    'Victoria Island Luxury Apartments'
);

-- Remove any investments for the deleted projects
DELETE FROM investments WHERE project_id IN (
    SELECT id FROM projects WHERE title IN (
        'Kobape Gardens - Phase 1',
        'Victoria Island Luxury Apartments'
    )
);

-- Now let's clean up and recreate the projects table with only real plots
-- First, backup existing data
CREATE TEMP TABLE temp_projects AS SELECT * FROM projects;

-- Clear the projects table
TRUNCATE projects RESTART IDENTITY CASCADE;

-- Insert only the real plots
INSERT INTO projects (title, description, location, total_sqm, price_per_sqm, amenities, image_urls) VALUES
('2 Seasons - Plot 77', 'Premium residential plot in 2 Seasons Estate', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 79', 'Exclusive residential plot', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Lakefront'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 81', 'Premium plot in the wellness village with spa access', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Wellness center', 'Spa access'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 84', 'Family-oriented plot near community facilities', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Community center', 'Playground'], ARRAY['/2-seasons/2seasons-logo.jpg']),
('2 Seasons - Plot 87', 'Executive plot with premium amenities', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Executive lounge', 'Premium parking'], ARRAY['/2-seasons/2seasons-logo.jpg']);

-- Clean up investments - remove any that don't have valid project_id
DELETE FROM investments WHERE project_id NOT IN (SELECT id FROM projects);

-- Clean up forum topics - remove any that don't have valid user_id
DELETE FROM forum_topics WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Clean up forum replies - remove any that don't have valid user_id
DELETE FROM forum_replies WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Verify the cleanup
SELECT '=== AFTER CLEANUP VERIFICATION ===' as info;

SELECT 'Real Plots Only:' as status;
SELECT id, title, total_sqm, price_per_sqm FROM projects ORDER BY id;

SELECT 'Plot 77 Investments:' as status;
SELECT 
    i.sqm_purchased,
    i.amount,
    i.status
FROM investments i
WHERE i.project_id = 1;

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

SELECT 'Total Projects:' as metric, COUNT(*) as count FROM projects
UNION ALL
SELECT 'Total Investments:' as metric, COUNT(*) as count FROM investments
UNION ALL
SELECT 'Total Forum Topics:' as metric, COUNT(*) as count FROM forum_topics
UNION ALL
SELECT 'Total Forum Replies:' as metric, COUNT(*) as count FROM forum_replies;

-- Clean up temporary table
DROP TABLE temp_projects;
