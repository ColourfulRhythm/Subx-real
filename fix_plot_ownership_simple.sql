-- FIX: Simple plot ownership population using auth.users
-- This avoids the complex CASE statement that was causing NULL values

-- 1. First, let's check what's in auth.users
SELECT 'Auth users count:' as info;
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 2. Show sample auth users
SELECT 'Sample auth users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at LIMIT 10;

-- 3. Clear existing data
TRUNCATE TABLE plot_ownership CASCADE;

-- 4. Now populate plot ownership using a simpler approach
-- We'll manually specify the values instead of complex CASE statements

-- Plot 1 (Plot 77) - 6 co-owners, 63 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    1 as plot_id,
    id as user_id,
    10 as sqm_owned,  -- Simple fixed value
    50000 as amount_paid,  -- Simple fixed value
    NOW() as created_at
FROM auth.users 
ORDER BY created_at 
LIMIT 6;

-- Plot 2 - 5 co-owners, 45 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    2 as plot_id,
    id as user_id,
    9 as sqm_owned,  -- Simple fixed value
    45000 as amount_paid,  -- Simple fixed value
    NOW() as created_at
FROM auth.users 
ORDER BY created_at 
LIMIT 5 OFFSET 6;

-- Plot 3 - 4 co-owners, 30 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    3 as plot_id,
    id as user_id,
    7 as sqm_owned,  -- Simple fixed value
    35000 as amount_paid,  -- Simple fixed value
    NOW() as created_at
FROM auth.users 
ORDER BY created_at 
LIMIT 4 OFFSET 11;

-- Plot 4 - 3 co-owners, 20 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    4 as plot_id,
    id as user_id,
    6 as sqm_owned,  -- Simple fixed value
    30000 as amount_paid,  -- Simple fixed value
    NOW() as created_at
FROM auth.users 
ORDER BY created_at 
LIMIT 3 OFFSET 15;

-- Plot 5 - 2 co-owners, 12 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    5 as plot_id,
    id as user_id,
    6 as sqm_owned,  -- Simple fixed value
    30000 as amount_paid,  -- Simple fixed value
    NOW() as created_at
FROM auth.users 
ORDER BY created_at 
LIMIT 2 OFFSET 18;

-- 5. Verify the data was inserted correctly
SELECT 'Plot ownership summary for all plots:' as info;
SELECT 
    po.plot_id,
    COUNT(*) as co_owners_count,
    SUM(po.sqm_owned) as total_sqm_owned,
    SUM(po.amount_paid) as total_amount_paid
FROM plot_ownership po
GROUP BY po.plot_id
ORDER BY po.plot_id;

-- 6. Show detailed co-owners for each plot
SELECT 'Detailed co-owners for Plot 1:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    au.email
FROM plot_ownership po
LEFT JOIN auth.users au ON po.user_id = au.id
WHERE po.plot_id = 1
ORDER BY po.sqm_owned DESC;

-- 7. Show total summary
SELECT 'Total ownership across all plots:' as info;
SELECT 
    COUNT(DISTINCT po.plot_id) as total_plots,
    COUNT(*) as total_co_owners,
    SUM(po.sqm_owned) as total_sqm_owned,
    SUM(po.amount_paid) as total_amount_invested
FROM plot_ownership po;
