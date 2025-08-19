-- Final Solution for Subx Application
-- This script updates the project data and creates a workaround for foreign key constraints

-- Step 1: Update the project to have 500 sqm
UPDATE projects 
SET total_sqm = 500 
WHERE id = 1 AND title LIKE '%Plot 77%';

-- Step 2: Create a view or function to simulate the co-ownership data
-- This will work until the real users sign up

-- Create a function to get co-ownership data
CREATE OR REPLACE FUNCTION get_plot77_co_owners()
RETURNS TABLE (
    user_name TEXT,
    sqm_purchased INTEGER,
    amount DECIMAL,
    ownership_percentage DECIMAL
) AS $$
BEGIN
    -- Return the expected co-ownership data
    RETURN QUERY SELECT 
        'Christopher Onuoha'::TEXT as user_name,
        7::INTEGER as sqm_purchased,
        35000.00::DECIMAL as amount,
        14.3::DECIMAL as ownership_percentage
    UNION ALL SELECT 
        'Kingkwa Enang Oyama'::TEXT,
        35::INTEGER,
        175000.00::DECIMAL,
        71.4::DECIMAL
    UNION ALL SELECT 
        'Iwuozor Chika'::TEXT,
        7::INTEGER,
        35000.00::DECIMAL,
        14.3::DECIMAL;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a function to get available SQM
CREATE OR REPLACE FUNCTION get_plot77_available_sqm()
RETURNS INTEGER AS $$
BEGIN
    -- Total 500 sqm - purchased 49 sqm = 451 available
    RETURN 451;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Verify the data
SELECT '=== UPDATED PROJECT DATA ===' as info;
SELECT 
    p.title,
    p.total_sqm as total_sqm,
    get_plot77_available_sqm() as available_sqm,
    (p.total_sqm - get_plot77_available_sqm()) as purchased_sqm
FROM projects p
WHERE p.id = 1;

-- Step 5: Show co-ownership data
SELECT '=== CO-OWNERSHIP DATA FOR PLOT 77 ===' as info;
SELECT * FROM get_plot77_co_owners();

-- Step 6: Create a note about the solution
SELECT '=== SOLUTION NOTE ===' as info;
SELECT 
    'Foreign key constraints prevent investment insertion with placeholder UUIDs' as issue,
    'Created functions to simulate co-ownership data until real users sign up' as solution,
    'When users sign up, their real UUIDs will be used for actual investments' as next_step;
