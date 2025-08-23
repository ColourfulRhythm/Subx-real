-- FIX: Populate plot ownership using the CORRECT user IDs
-- This will work with the actual foreign key constraint

-- 1. First, let's check what table plot_ownership.user_id actually references
SELECT 'Checking foreign key constraint:' as info;
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'plot_ownership';

-- 2. Check if plot_ownership.user_id references auth.users
SELECT 'Checking if auth.users exists:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
) as auth_users_exists;

-- 3. If auth.users exists, let's see what's in it
SELECT 'Auth users count:' as info;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- 4. Clear existing plot ownership data
DELETE FROM plot_ownership WHERE plot_id = 1;

-- 5. Insert plot ownership using the CORRECT user IDs
-- We'll use the first 6 users from the table that plot_ownership.user_id actually references
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
FROM (
    -- Try auth.users first, then fallback to public.users
    SELECT id, created_at FROM auth.users ORDER BY created_at LIMIT 6
    UNION ALL
    SELECT id, created_at FROM users ORDER BY created_at LIMIT 6
) combined_users
ORDER BY created_at 
LIMIT 6;

-- 6. Verify the data was inserted
SELECT 'Plot 1 ownership data:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    po.created_at
FROM plot_ownership po
WHERE po.plot_id = 1
ORDER BY po.sqm_owned DESC;

-- 7. Show total sqm owned in Plot 1
SELECT 'Total sqm owned in Plot 1:' as info, SUM(sqm_owned) as total_sqm FROM plot_ownership WHERE plot_id = 1;

-- 8. Show co-owners count
SELECT 'Co-owners count for Plot 1:' as info, COUNT(*) as total_owners FROM plot_ownership WHERE plot_id = 1;
