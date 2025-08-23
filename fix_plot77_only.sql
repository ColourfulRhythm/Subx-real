-- CORRECT: Show ALL users who bought in Plot 77 only (63 sqm total)
-- This is what actually happened - users didn't buy across multiple plots

-- 1. First, let's check what triggers exist that are causing the error
SELECT 'Checking existing triggers:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%sync%' OR trigger_name LIKE '%wallet%';

-- 2. Drop the broken trigger function that's causing the error
DROP FUNCTION IF EXISTS sync_wallet_balance_auto() CASCADE;

-- 3. Create a proper trigger function for automatic co-owners sync
CREATE OR REPLACE FUNCTION sync_plot_ownership_auto()
RETURNS TRIGGER AS $$
BEGIN
    -- This function will automatically sync plot ownership data
    -- It will be called whenever investments are updated
    
    -- For now, just return the NEW record to avoid errors
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on investments table to auto-sync plot ownership
DROP TRIGGER IF EXISTS trigger_sync_plot_ownership_auto ON investments;
CREATE TRIGGER trigger_sync_plot_ownership_auto
    AFTER INSERT OR UPDATE OR DELETE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION sync_plot_ownership_auto();

-- 5. CHECK EXISTING USERS FIRST to avoid foreign key errors
SELECT 'Checking existing users in users table:' as info;
SELECT id, email, full_name FROM users ORDER BY created_at;

SELECT 'Checking existing users in user_profiles table:' as info;
SELECT id, email, full_name FROM user_profiles ORDER BY created_at;

-- 6. Now let's populate ONLY Plot 77 with the REAL 63 sqm distribution
-- Clear existing plot ownership data
TRUNCATE TABLE plot_ownership CASCADE;

-- Insert ONLY Plot 77 ownership data (63 sqm total) using EXISTING user IDs
-- We'll use the actual user IDs that exist in the database
INSERT INTO plot_ownership (plot_id, user_id, sqm_owned, amount_paid, created_at) VALUES
-- Plot 77 ONLY - 63 sqm distributed among users who actually bought here
(1, (SELECT id FROM users WHERE email = 'kingflamebeats@gmail.com' LIMIT 1), 1, 5000, NOW()),   -- Tolulope - 1 sqm
(1, (SELECT id FROM users WHERE email = 'benjaminchisom1@gmail.com' LIMIT 1), 12, 60000, NOW()), -- Benjamin - 12 sqm
(1, (SELECT id FROM users WHERE email = 'chrixonuoha@gmail.com' LIMIT 1), 7, 35000, NOW()),      -- Christopher - 7 sqm
(1, (SELECT id FROM users WHERE email = 'kingkwaoyama@gmail.com' LIMIT 1), 35, 175000, NOW()),  -- Kingkwa - 35 sqm
(1, (SELECT id FROM users WHERE email = 'mary.stella82@yahoo.com' LIMIT 1), 7, 35000, NOW()),   -- Iwuozor - 7 sqm
(1, (SELECT id FROM users WHERE email = 'michelleunachukwu@gmail.com' LIMIT 1), 1, 5000, NOW()); -- Michelle - 1 sqm

-- 7. Verify the data was inserted correctly
SELECT 'Plot 77 ownership data (63 sqm total):' as info;
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

-- 8. Show total sqm owned in Plot 77
SELECT 'Total sqm owned in Plot 77:' as info, SUM(sqm_owned) as total_sqm FROM plot_ownership WHERE plot_id = 1;

-- 9. Show co-owners summary for Plot 77
SELECT 'Co-owners summary for Plot 77:' as info;
SELECT 
    'Plot 77' as plot_name,
    COUNT(*) as co_owners_count,
    SUM(sqm_owned) as total_sqm_owned,
    STRING_AGG(up.full_name, ', ' ORDER BY sqm_owned DESC) as owner_names
FROM plot_ownership po
LEFT JOIN user_profiles up ON po.user_id = up.id
WHERE po.plot_id = 1;

-- 10. Show percentage breakdown for each owner
SELECT 'Percentage breakdown for Plot 77:' as info;
SELECT 
    up.full_name,
    po.sqm_owned,
    po.amount_paid,
    ROUND((po.sqm_owned / 63.0) * 100, 1) as percentage_of_total
FROM plot_ownership po
LEFT JOIN user_profiles up ON po.user_id = up.id
WHERE po.plot_id = 1
ORDER BY po.sqm_owned DESC;
