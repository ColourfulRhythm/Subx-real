-- SIMPLE: Populate only Plot 1 (Plot 77) with the 6 users and 63 sqm
-- This will make the co-owners function work for Plot 1

-- 1. First, let's see what users actually exist
SELECT 'Available users in database:' as info;
SELECT id, email, full_name FROM users ORDER BY created_at;

-- 2. Clear any existing plot ownership data
DELETE FROM plot_ownership WHERE plot_id = 1;

-- 3. Insert the 6 users into Plot 1 (using the first 6 users that exist)
-- We'll use the actual user IDs from the database
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

-- 4. Verify the data was inserted
SELECT 'Plot 1 ownership data:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    u.email,
    u.full_name
FROM plot_ownership po
JOIN users u ON po.user_id = u.id
WHERE po.plot_id = 1
ORDER BY po.sqm_owned DESC;

-- 5. Show total sqm owned in Plot 1
SELECT 'Total sqm owned in Plot 1:' as info, SUM(sqm_owned) as total_sqm FROM plot_ownership WHERE plot_id = 1;

-- 6. Show co-owners count
SELECT 'Co-owners count for Plot 1:' as info, COUNT(*) as total_owners FROM plot_ownership WHERE plot_id = 1;
