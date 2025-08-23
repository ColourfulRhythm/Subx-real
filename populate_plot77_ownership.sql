-- Populate Plot 77 ownership with 63 sqm distributed among various owners
-- This will make the co-owners function work properly

-- First, let's check what's currently in the table
SELECT 'Current plot_ownership data:' as info;
SELECT * FROM plot_ownership WHERE plot_id = 1;

-- Clear any existing data for Plot 77
DELETE FROM plot_ownership WHERE plot_id = 1;

-- Insert the 63 sqm ownership distribution for Plot 77
-- Based on the user data we have
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
-- Benjamin Chisom Unachukwu - 12 sqm
(1, '2a702233-15bd-4563-ad81-ee6c1b0df9d9', 12, 60000, NOW()),
-- Tolulope Olugbode - 1 sqm  
(1, '1b811183-6701-4892-9202-4a419abb7796', 1, 5000, NOW()),
-- Christopher Onuoha - 7 sqm
(1, '3c922294-7812-5903-0303-5b52bbcc8897', 7, 35000, NOW()),
-- Kingkwa Enang Oyama - 35 sqm
(1, '4d033405-8923-6014-1414-6c63ccdd9908', 35, 175000, NOW()),
-- Iwuozor Chika - 7 sqm
(1, '5e144516-9034-7125-2525-7d74ddee0019', 7, 35000, NOW()),
-- Michelle Unachukwu - 1 sqm
(1, '6f255627-0145-8236-3636-8e85eeff1120', 1, 5000, NOW());

-- Verify the data was inserted
SELECT 'New plot_ownership data for Plot 77:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    up.full_name,
    up.email
FROM plot_ownership po
LEFT JOIN user_profiles up ON po.user_id = up.id
WHERE po.plot_id = 1
ORDER BY po.sqm_owned DESC;

-- Show total sqm owned
SELECT 'Total sqm owned in Plot 77:' as info, SUM(sqm_owned) as total_sqm FROM plot_ownership WHERE plot_id = 1;
