-- WORKING Cleanup script that doesn't violate foreign key constraints
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
INSERT INTO projects (title, description, location, total_sqm, price_per_sqm, amenities, image_urls)
SELECT '2 Seasons - Plot 79', 'Premium residential plot in 2 Seasons Estate - Gated community with jogging & cycling lanes', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Gated community', 'Jogging lanes', 'Cycling lanes'], ARRAY['/2-seasons/2seasons-logo.jpg']
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = '2 Seasons - Plot 79');

INSERT INTO projects (title, description, location, total_sqm, price_per_sqm, amenities, image_urls)
SELECT '2 Seasons - Plot 81', 'Premium residential plot near wellness hub - Proximity to wellness facilities', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Proximity to wellness hub'], ARRAY['/2-seasons/2seasons-logo.jpg']
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = '2 Seasons - Plot 81');

INSERT INTO projects (title, description, location, total_sqm, price_per_sqm, amenities, image_urls)
SELECT '2 Seasons - Plot 84', 'Family-oriented residential plot near community facilities - Daycare/school & mini shopping mall', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Daycare/school proximity', 'Mini shopping mall', 'Play areas'], ARRAY['/2-seasons/2seasons-logo.jpg']
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = '2 Seasons - Plot 84');

INSERT INTO projects (title, description, location, total_sqm, price_per_sqm, amenities, image_urls)
SELECT '2 Seasons - Plot 87', 'Premium residential plot in landscaped streets - Play areas and community amenities', '2 Seasons, Along Gbako/Kajola village road, Gbako Village, Via Kobape Obafemi-Owode Lga, Ogun state', 500, 5000.00, ARRAY['Road access', 'Security', 'Drainage', 'Landscaped streets', 'Play areas'], ARRAY['/2-seasons/2seasons-logo.jpg']
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = '2 Seasons - Plot 87');

-- Step 4: Check what investments already exist for Plot 77
SELECT '=== CHECKING EXISTING PLOT 77 INVESTMENTS ===' as info;
SELECT 
    i.id,
    i.user_id,
    i.sqm_purchased,
    i.amount,
    i.status,
    up.full_name,
    up.phone
FROM investments i
LEFT JOIN user_profiles up ON i.user_id = up.id
WHERE i.project_id = 1
ORDER BY i.amount DESC;

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
LEFT JOIN user_profiles up ON i.user_id = up.id
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

-- Show co-ownership breakdown for Plot 77 (only for existing investments)
SELECT '=== PLOT 77 CO-OWNERSHIP BREAKDOWN ===' as info;
SELECT 
    COALESCE(up.full_name, 'Unknown User') as user_name,
    i.sqm_purchased,
    i.amount,
    ROUND((i.sqm_purchased::DECIMAL / 500::DECIMAL) * 100, 1) as ownership_percentage
FROM investments i
LEFT JOIN user_profiles up ON i.user_id = up.id
WHERE i.project_id = 1 AND i.status = 'completed'
ORDER BY i.amount DESC;

-- Show what needs to be done next
SELECT '=== NEXT STEPS ===' as info;
SELECT 'To add the missing co-owners (Christopher, Kingkwa, Iwuozor, Tolulope):' as instruction
UNION ALL
SELECT '1. They need to sign up with their real emails'
UNION ALL
SELECT '2. The system will automatically link them to their investments'
UNION ALL
SELECT '3. Or use the link_unverified_users.sql script after they sign up'
UNION ALL
SELECT '4. For now, the cleanup is complete and shows only real data';
