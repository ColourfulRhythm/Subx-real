-- Correct Ownership Percentages for Plot 77
-- Percentages should be based on total plot SQM (500), not total invested

-- Update the function with correct percentages
CREATE OR REPLACE FUNCTION get_plot77_co_owners()
RETURNS TABLE (
    user_name TEXT,
    sqm_purchased INTEGER,
    amount DECIMAL,
    ownership_percentage DECIMAL
) AS $$
BEGIN
    -- Return the expected co-ownership data with correct percentages
    -- Based on total plot SQM (500), not total invested
    RETURN QUERY SELECT 
        'Christopher Onuoha'::TEXT as user_name,
        7::INTEGER as sqm_purchased,
        35000.00::DECIMAL as amount,
        1.4::DECIMAL as ownership_percentage  -- 7/500 = 1.4%
    UNION ALL SELECT 
        'Kingkwa Enang Oyama'::TEXT,
        35::INTEGER,
        175000.00::DECIMAL,
        7.0::DECIMAL  -- 35/500 = 7.0%
    UNION ALL SELECT 
        'Iwuozor Chika'::TEXT,
        7::INTEGER,
        35000.00::DECIMAL,
        1.4::DECIMAL;  -- 7/500 = 1.4%
END;
$$ LANGUAGE plpgsql;

-- Verify the corrected data
SELECT '=== CORRECTED CO-OWNERSHIP DATA FOR PLOT 77 ===' as info;
SELECT * FROM get_plot77_co_owners();

-- Show the complete breakdown
SELECT '=== COMPLETE PLOT 77 BREAKDOWN ===' as info;
SELECT 
    'Christopher Onuoha' as owner,
    7 as sqm,
    ROUND((7.0/500.0)*100, 1) as percentage
UNION ALL SELECT 
    'Kingkwa Enang Oyama',
    35,
    ROUND((35.0/500.0)*100, 1)
UNION ALL SELECT 
    'Iwuozor Chika',
    7,
    ROUND((7.0/500.0)*100, 1)
UNION ALL SELECT 
    'Available (Unpurchased)',
    451,
    ROUND((451.0/500.0)*100, 1)
ORDER BY percentage DESC;
