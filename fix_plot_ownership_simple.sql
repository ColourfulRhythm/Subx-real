-- FIX: Simple and reliable plot ownership population
-- This will work without complex CASE statements

-- 1. First, let's see what users exist in auth.users
SELECT 'Available users in auth.users:' as info;
SELECT id, email FROM auth.users ORDER BY created_at;

-- 2. Check how many users we have in auth.users
SELECT 'Total users in auth.users:' as info;
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. Clear existing plot ownership data
TRUNCATE TABLE plot_ownership CASCADE;

-- 4. Now let's populate plots with simple, direct values
-- Plot 1 (Plot 77) - 6 co-owners, 63 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 0), 1, 5000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 1), 12, 60000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 2), 7, 35000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 3), 35, 175000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 4), 7, 35000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 5), 1, 5000, NOW());

-- Plot 2 - 5 co-owners, 45 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
(2, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 6), 5, 25000, NOW()),
(2, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 7), 10, 50000, NOW()),
(2, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 8), 15, 75000, NOW()),
(2, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 9), 10, 50000, NOW()),
(2, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 10), 5, 25000, NOW());

-- Plot 3 - 4 co-owners, 30 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
(3, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 11), 8, 40000, NOW()),
(3, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 12), 7, 35000, NOW()),
(3, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 13), 10, 50000, NOW()),
(3, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 14), 5, 25000, NOW());

-- Plot 4 - 3 co-owners, 20 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
(4, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 15), 10, 50000, NOW()),
(4, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 16), 6, 30000, NOW()),
(4, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 17), 4, 20000, NOW());

-- Plot 5 - 2 co-owners, 12 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
(5, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 18), 7, 35000, NOW()),
(5, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 19), 5, 25000, NOW());

-- 5. Verify the data was inserted correctly
SELECT 'Plot ownership summary for all plots:' as info;
SELECT 
    po.plot_id,
    p.title as plot_title,
    COUNT(*) as co_owners_count,
    SUM(po.sqm_owned) as total_sqm_owned,
    SUM(po.amount_paid) as total_amount_paid
FROM plot_ownership po
LEFT JOIN projects p ON po.plot_id = p.id
GROUP BY po.plot_id, p.title
ORDER BY po.plot_id;

-- 6. Show detailed co-owners for each plot
SELECT 'Detailed co-owners for Plot 1:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    au.email,
    ROUND((po.sqm_owned / 63.0) * 100, 1) as percentage_of_total
FROM plot_ownership po
LEFT JOIN auth.users au ON po.user_id = au.id
WHERE po.plot_id = 1
ORDER BY po.sqm_owned DESC;

SELECT 'Detailed co-owners for Plot 2:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    au.email,
    ROUND((po.sqm_owned / 45.0) * 100, 1) as percentage_of_total
FROM plot_ownership po
LEFT JOIN auth.users au ON po.user_id = au.id
WHERE po.plot_id = 2
ORDER BY po.sqm_owned DESC;

-- 7. Show total summary
SELECT 'Total ownership across all plots:' as info;
SELECT 
    COUNT(DISTINCT po.plot_id) as total_plots,
    COUNT(*) as total_co_owners,
    SUM(po.sqm_owned) as total_sqm_owned,
    SUM(po.amount_paid) as total_amount_invested
FROM plot_ownership po;
