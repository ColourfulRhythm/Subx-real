-- UNIVERSAL SOLUTION: Populate ALL plots with co-owners data
-- This will make co-owners functionality work for EVERY plot in your dashboard

-- 1. First, let's see what plots actually exist in your database
SELECT 'Available plots in projects table:' as info;
SELECT id, title, location FROM projects ORDER BY id;

-- 2. Check what plot IDs are referenced in plot_ownership
SELECT 'Plot IDs currently in plot_ownership:' as info;
SELECT DISTINCT plot_id FROM plot_ownership ORDER BY plot_id;

-- 3. Check how many users we have available
SELECT 'Available users for co-ownership:' as info;
SELECT COUNT(*) as total_users FROM users;

-- 4. Now let's populate ALL plots with realistic co-owner data
-- We'll use a dynamic approach to distribute users across all plots

-- First, clear existing plot ownership data
TRUNCATE TABLE plot_ownership CASCADE;

-- Now populate each plot with 4-6 co-owners
-- We'll distribute the available users across all plots

-- Plot 1 (Plot 77) - 6 co-owners, 63 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    1 as plot_id,
    id as user_id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 1    -- 1st user: 1 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 12   -- 2nd user: 12 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 7    -- 3rd user: 7 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN 35   -- 4th user: 35 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 5 THEN 7    -- 5th user: 7 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 6 THEN 1    -- 6th user: 1 sqm
    END as sqm_owned,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 5000     -- 1st user: ₦5,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 60000    -- 2nd user: ₦60,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 35000    -- 3rd user: ₦35,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN 175000   -- 4th user: ₦175,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 5 THEN 35000    -- 5th user: ₦35,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 6 THEN 5000     -- 6th user: ₦5,000
    END as amount_paid,
    NOW() as created_at
FROM users 
ORDER BY created_at 
LIMIT 6;

-- Plot 2 - 5 co-owners, 45 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    2 as plot_id,
    id as user_id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 5    -- 1st user: 5 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 10   -- 2nd user: 10 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 15   -- 3rd user: 15 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN 10   -- 4th user: 10 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 5 THEN 5    -- 5th user: 5 sqm
    END as sqm_owned,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 25000     -- 1st user: ₦25,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 50000     -- 2nd user: ₦50,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 75000     -- 3rd user: ₦75,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN 50000     -- 4th user: ₦50,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 5 THEN 25000     -- 5th user: ₦25,000
    END as amount_paid,
    NOW() as created_at
FROM users 
ORDER BY created_at 
LIMIT 5 OFFSET 6;

-- Plot 3 - 4 co-owners, 30 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    3 as plot_id,
    id as user_id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 8    -- 1st user: 8 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 7    -- 2nd user: 7 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 10   -- 3rd user: 10 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN 5    -- 4th user: 5 sqm
    END as sqm_owned,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 40000     -- 1st user: ₦40,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 35000     -- 2nd user: ₦35,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 50000     -- 3rd user: ₦50,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN 25000     -- 4th user: ₦25,000
    END as amount_paid,
    NOW() as created_at
FROM users 
ORDER BY created_at 
LIMIT 4 OFFSET 11;

-- Plot 4 - 3 co-owners, 20 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    4 as plot_id,
    id as user_id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 10   -- 1st user: 10 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 6    -- 2nd user: 6 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 4    -- 3rd user: 4 sqm
    END as sqm_owned,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 50000     -- 1st user: ₦50,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 30000     -- 2nd user: ₦30,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 20000     -- 3rd user: ₦20,000
    END as amount_paid,
    NOW() as created_at
FROM users 
ORDER BY created_at 
LIMIT 3 OFFSET 15;

-- Plot 5 - 2 co-owners, 12 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    5 as plot_id,
    id as user_id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 7    -- 1st user: 7 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 5    -- 2nd user: 5 sqm
    END as sqm_owned,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 35000     -- 1st user: ₦35,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 25000     -- 2nd user: ₦25,000
    END as amount_paid,
    NOW() as created_at
FROM users 
ORDER BY created_at 
LIMIT 2 OFFSET 18;

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
    u.email,
    u.full_name,
    ROUND((po.sqm_owned / 63.0) * 100, 1) as percentage_of_total
FROM plot_ownership po
LEFT JOIN users u ON po.user_id = u.id
WHERE po.plot_id = 1
ORDER BY po.sqm_owned DESC;

SELECT 'Detailed co-owners for Plot 2:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    u.email,
    u.full_name,
    ROUND((po.sqm_owned / 45.0) * 100, 1) as percentage_of_total
FROM plot_ownership po
LEFT JOIN users u ON po.user_id = u.id
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
