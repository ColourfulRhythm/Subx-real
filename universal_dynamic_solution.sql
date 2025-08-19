-- Universal Dynamic Solution for ALL Plots
-- This will work for any plot when users buy SQM

-- Step 1: Create a universal dynamic function for any plot
CREATE OR REPLACE FUNCTION get_plot_co_owners_dynamic(plot_id INTEGER)
RETURNS TABLE (
    user_name TEXT,
    sqm_purchased INTEGER,
    amount DECIMAL,
    ownership_percentage DECIMAL,
    is_real_user BOOLEAN
) AS $$
DECLARE
    total_plot_sqm INTEGER;
BEGIN
    -- Get the total SQM for this plot
    SELECT total_sqm INTO total_plot_sqm
    FROM projects 
    WHERE id = plot_id;
    
    -- If plot doesn't exist, return empty
    IF total_plot_sqm IS NULL THEN
        RETURN;
    END IF;
    
    -- Return real investment data for this plot
    RETURN QUERY 
    SELECT 
        COALESCE(up.full_name, 'Unknown User')::TEXT as user_name,
        i.sqm_purchased::INTEGER,
        i.amount::DECIMAL,
        ROUND((i.sqm_purchased::DECIMAL / total_plot_sqm::DECIMAL) * 100, 1)::DECIMAL as ownership_percentage,
        TRUE::BOOLEAN as is_real_user
    FROM investments i
    LEFT JOIN user_profiles up ON i.user_id = up.id
    WHERE i.project_id = plot_id AND i.status = 'completed'
    ORDER BY i.sqm_purchased DESC;
    
    -- If no real data exists, return empty (no placeholder data for other plots)
    -- Only Plot 77 has placeholder data for existing users
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a universal function to get available SQM for any plot
CREATE OR REPLACE FUNCTION get_plot_available_sqm_dynamic(plot_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_plot_sqm INTEGER;
    total_purchased INTEGER;
BEGIN
    -- Get the total SQM for this plot
    SELECT total_sqm INTO total_plot_sqm
    FROM projects 
    WHERE id = plot_id;
    
    -- If plot doesn't exist, return 0
    IF total_plot_sqm IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate total purchased SQM from real investments
    SELECT COALESCE(SUM(sqm_purchased), 0) INTO total_purchased
    FROM investments 
    WHERE project_id = plot_id AND status = 'completed';
    
    -- Return available SQM (total - purchased)
    RETURN total_plot_sqm - total_purchased;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a special function for Plot 77 that includes placeholder data
CREATE OR REPLACE FUNCTION get_plot77_with_placeholders()
RETURNS TABLE (
    user_name TEXT,
    sqm_purchased INTEGER,
    amount DECIMAL,
    ownership_percentage DECIMAL,
    is_real_user BOOLEAN
) AS $$
DECLARE
    has_real_data BOOLEAN := FALSE;
BEGIN
    -- First, try to get real investment data
    SELECT EXISTS(
        SELECT 1 FROM investments 
        WHERE project_id = 1 AND status = 'completed'
    ) INTO has_real_data;
    
    -- If real data exists, return it
    IF has_real_data THEN
        RETURN QUERY SELECT * FROM get_plot_co_owners_dynamic(1);
    ELSE
        -- Return placeholder data for existing users
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

-- Step 4: Test the universal functions
SELECT '=== UNIVERSAL DYNAMIC FUNCTIONS ===' as info;

-- Test for Plot 77 (with placeholders)
SELECT 'Plot 77 Co-Owners:' as plot_info;
SELECT * FROM get_plot77_with_placeholders();

-- Test for Plot 2 (should be empty initially)
SELECT 'Plot 2 Co-Owners:' as plot_info;
SELECT * FROM get_plot_co_owners_dynamic(2);

-- Test available SQM for different plots
SELECT '=== AVAILABLE SQM FOR ALL PLOTS ===' as info;
SELECT 
    p.id as plot_id,
    p.title as plot_name,
    p.total_sqm as total_sqm,
    get_plot_available_sqm_dynamic(p.id) as available_sqm,
    (p.total_sqm - get_plot_available_sqm_dynamic(p.id)) as purchased_sqm
FROM projects p
ORDER BY p.id;

-- Step 5: Show how it works for all plots
SELECT '=== HOW IT WORKS FOR ALL PLOTS ===' as info;
SELECT 
    'When ANY user buys SQM from ANY plot:' as step,
    '1. Investment is inserted into investments table' as action
UNION ALL SELECT 
    '2. get_plot_co_owners_dynamic(plot_id) automatically includes the new purchase',
    '3. get_plot_available_sqm_dynamic(plot_id) automatically reduces available SQM'
UNION ALL SELECT 
    '4. Dashboard shows real-time updated co-ownership data for that plot',
    '5. Percentages are calculated based on actual purchases for that specific plot'
UNION ALL SELECT 
    '6. Works for Plot 77, Plot 2, Plot 3, and any future plots',
    '7. Each plot maintains its own independent co-ownership data';
