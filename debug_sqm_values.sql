-- DEBUG: Check what SQM values are actually being inserted
-- This will show us why the total SQM is wrong

-- 1. First, let's see what users exist in auth.users
SELECT 'Available users in auth.users:' as info;
SELECT id, email FROM auth.users ORDER BY created_at;

-- 2. Check how many users we have
SELECT 'Total users in auth.users:' as info;
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. Clear existing plot ownership data
TRUNCATE TABLE plot_ownership CASCADE;

-- 4. Let's test with just ONE plot first to see what's happening
-- Plot 1 (Plot 77) - 6 co-owners, 63 sqm total
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 0), 1, 5000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 1), 12, 60000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 2), 7, 35000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 3), 35, 175000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 4), 7, 35000, NOW()),
(1, (SELECT id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 5), 1, 5000, NOW());

-- 5. Check what was actually inserted for Plot 1
SELECT 'Plot 1 data after insert:' as info;
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

-- 6. Check the total SQM for Plot 1
SELECT 'Plot 1 total SQM:' as info;
SELECT 
    plot_id,
    COUNT(*) as co_owners_count,
    SUM(sqm_owned) as total_sqm_owned,
    SUM(amount_paid) as total_amount_paid
FROM plot_ownership 
WHERE plot_id = 1
GROUP BY plot_id;

-- 7. Let's also check if there are any NULL values
SELECT 'Checking for NULL values:' as info;
SELECT 
    plot_id,
    user_id,
    sqm_owned,
    amount_paid
FROM plot_ownership 
WHERE sqm_owned IS NULL OR amount_paid IS NULL;

-- 8. Let's see the raw data without any joins
SELECT 'Raw plot_ownership data:' as info;
SELECT * FROM plot_ownership ORDER BY plot_id, sqm_owned DESC;
