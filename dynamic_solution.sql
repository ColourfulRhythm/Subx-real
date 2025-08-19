-- Dynamic Solution for Real-Time Co-Ownership Updates
-- This will work when real users sign up and buy SQM

-- Step 1: Create a dynamic function that calculates real-time data
CREATE OR REPLACE FUNCTION get_dynamic_plot77_data()
RETURNS TABLE (
    user_name TEXT,
    sqm_purchased INTEGER,
    amount DECIMAL,
    ownership_percentage DECIMAL,
    is_real_user BOOLEAN
) AS $$
BEGIN
    -- First, try to get real investment data
    RETURN QUERY 
    SELECT 
        COALESCE(up.full_name, 'Unknown User')::TEXT as user_name,
        i.sqm_purchased::INTEGER,
        i.amount::DECIMAL,
        ROUND((i.sqm_purchased::DECIMAL / 500.0) * 100, 1)::DECIMAL as ownership_percentage,
        TRUE::BOOLEAN as is_real_user
    FROM investments i
    LEFT JOIN user_profiles up ON i.user_id = up.id
    WHERE i.project_id = 1 AND i.status = 'completed'
    ORDER BY i.sqm_purchased DESC;
    
    -- If no real data exists, return placeholder data
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            'Christopher Onuoha'::TEXT as user_name,
            7::INTEGER as sqm_purchased,
            35000.00::DECIMAL as amount,
            1.4::DECIMAL as ownership_percentage,
            FALSE::BOOLEAN as is_real_user
        UNION ALL SELECT 
            'Kingkwa Enang Oyama'::TEXT,
            35::INTEGER,
            175000.00::DECIMAL,
            7.0::DECIMAL,
            FALSE::BOOLEAN
        UNION ALL SELECT 
            'Iwuozor Chika'::TEXT,
            7::INTEGER,
            35000.00::DECIMAL,
            1.4::DECIMAL,
            FALSE::BOOLEAN;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a function to get real-time available SQM
CREATE OR REPLACE FUNCTION get_plot77_available_sqm_dynamic()
RETURNS INTEGER AS $$
DECLARE
    total_purchased INTEGER;
BEGIN
    -- Calculate total purchased SQM from real investments
    SELECT COALESCE(SUM(sqm_purchased), 0) INTO total_purchased
    FROM investments 
    WHERE project_id = 1 AND status = 'completed';
    
    -- Return available SQM (500 - purchased)
    RETURN 500 - total_purchased;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a trigger function to automatically update when investments change
CREATE OR REPLACE FUNCTION handle_investment_change()
RETURNS TRIGGER AS $$
BEGIN
    -- This function will be called whenever investments are inserted/updated/deleted
    -- You can add logging or notifications here if needed
    
    -- For now, just return the new record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to monitor investment changes
DROP TRIGGER IF EXISTS investment_change_trigger ON investments;
CREATE TRIGGER investment_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON investments
    FOR EACH ROW EXECUTE FUNCTION handle_investment_change();

-- Step 5: Test the dynamic functions
SELECT '=== DYNAMIC PLOT 77 DATA ===' as info;
SELECT * FROM get_dynamic_plot77_data();

SELECT '=== DYNAMIC AVAILABLE SQM ===' as info;
SELECT get_plot77_available_sqm_dynamic() as available_sqm;

-- Step 6: Show how it will work with real data
SELECT '=== HOW IT WORKS ===' as info;
SELECT 
    'When a real user buys SQM:' as step,
    '1. Investment is inserted into investments table' as action
UNION ALL SELECT 
    '2. get_dynamic_plot77_data() automatically includes the new purchase',
    '3. get_plot77_available_sqm_dynamic() automatically reduces available SQM'
UNION ALL SELECT 
    '4. Dashboard shows real-time updated co-ownership data',
    '5. Percentages are calculated based on actual purchases';
