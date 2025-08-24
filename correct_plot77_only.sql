-- CORRECT: Only Plot 77 with 6 real users and 63 sqm total
-- This matches the user's exact data: 6 users, 63 sqm total, ₦315,000 total

-- 1. FIRST: Clear ALL the wrong 170 sqm data
TRUNCATE TABLE plot_ownership CASCADE;

-- 2. NOW: Populate ONLY Plot 77 with the CORRECT 63 sqm data
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
(1, (SELECT id FROM auth.users WHERE email = 'kingflamebeats@gmail.com'), 1, 5000, NOW()),
(1, (SELECT id FROM auth.users WHERE email = 'michelleunachukwu@gmail.com'), 12, 60000, NOW()),
(1, (SELECT id FROM auth.users WHERE email = 'benjaminchisom1@gmail.com'), 7, 35000, NOW()),
(1, (SELECT id FROM auth.users WHERE email = 'chrixonuoha@gmail.com'), 35, 175000, NOW()),
(1, (SELECT id FROM auth.users WHERE email = 'kingkwaoyama@gmail.com'), 7, 35000, NOW()),
(1, (SELECT id FROM auth.users WHERE email = 'mary.stella82@yahoo.com'), 1, 5000, NOW());

-- 3. Verify the data was inserted correctly
SELECT 'Plot 77 data after insert:' as info;
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

-- 4. Check the total SQM for Plot 77
SELECT 'Plot 77 total summary:' as info;
SELECT
    plot_id,
    COUNT(*) as co_owners_count,
    SUM(sqm_owned) as total_sqm_owned,
    SUM(amount_paid) as total_amount_paid
FROM plot_ownership
WHERE plot_id = 1
GROUP BY plot_id;

-- 5. Show total summary across all plots (should only be Plot 77)
SELECT 'Total ownership across all plots:' as info;
SELECT
    COUNT(DISTINCT po.plot_id) as total_plots,
    COUNT(*) as total_co_owners,
    SUM(po.sqm_owned) as total_sqm_owned,
    SUM(po.amount_paid) as total_amount_invested
FROM plot_ownership po;

-- 6. Verify no NULL values
SELECT 'Checking for NULL values:' as info;
SELECT
    plot_id,
    user_id,
    sqm_owned,
    amount_paid
FROM plot_ownership
WHERE sqm_owned IS NULL OR amount_paid IS NULL;
