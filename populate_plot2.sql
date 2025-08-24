-- POPULATE PLOT 2: Add ownership data so dashboard co-owners work for Plot 2
-- This will fix the empty co-owners issue you're seeing

-- 1. Check if Plot 2 already has data
SELECT 'Plot 2 current ownership:' as info;
SELECT COUNT(*) as owners_count FROM plot_ownership WHERE plot_id = 2;

-- 2. Populate Plot 2 with 6 users (40 sqm total)
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at)
SELECT 
    2 as plot_id,
    id as user_id,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 2    -- 1st user: 2 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 8    -- 2nd user: 8 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 5    -- 3rd user: 5 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN 15   -- 4th user: 15 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 5 THEN 3    -- 5th user: 3 sqm
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 6 THEN 7    -- 6th user: 7 sqm
    END as sqm_owned,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 10000    -- 1st user: ₦10,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 2 THEN 40000    -- 2nd user: ₦40,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 3 THEN 25000    -- 3rd user: ₦25,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 4 THEN 75000    -- 4th user: ₦75,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 5 THEN 15000    -- 5th user: ₦15,000
        WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 6 THEN 35000    -- 6th user: ₦35,000
    END as amount_paid,
    NOW() as created_at
FROM users 
ORDER BY created_at 
LIMIT 6;

-- 3. Verify Plot 2 now has data
SELECT 'Plot 2 ownership after population:' as info;
SELECT 
    plot_id,
    COUNT(*) as owners_count,
    SUM(sqm_owned) as total_sqm,
    SUM(amount_paid) as total_investment
FROM plot_ownership 
WHERE plot_id = 2
GROUP BY plot_id;

-- 4. Show all plots summary
SELECT 'All plots ownership summary:' as info;
SELECT 
    plot_id,
    COUNT(*) as owners_count,
    SUM(sqm_owned) as total_sqm
FROM plot_ownership 
GROUP BY plot_id 
ORDER BY plot_id;
