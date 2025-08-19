-- Actual Plots Solution for Subx Application
-- Works with real plot numbers: 79, 81, 84, 87 and any future plots

-- Step 1: Create a universal dynamic function for any plot (including 79, 81, 84, 87)
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
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a special function for Plot 77 that includes placeholder data
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

-- Step 3: Test the functions with actual plot numbers
SELECT '=== ACTUAL PLOTS TEST ===' as info;

-- Test for Plot 77 (with placeholders)
SELECT 'Plot 77 Co-Owners:' as plot_info;
SELECT * FROM get_plot77_with_placeholders();

-- Test for Plot 79 (should be empty initially)
SELECT 'Plot 79 Co-Owners:' as plot_info;
SELECT * FROM get_plot_co_owners_dynamic(2); -- Assuming Plot 79 is project ID 2

-- Test for Plot 81 (should be empty initially)
SELECT 'Plot 81 Co-Owners:' as plot_info;
SELECT * FROM get_plot_co_owners_dynamic(3); -- Assuming Plot 81 is project ID 3

-- Test for Plot 84 (should be empty initially)
SELECT 'Plot 84 Co-Owners:' as plot_info;
SELECT * FROM get_plot_co_owners_dynamic(4); -- Assuming Plot 84 is project ID 4

-- Test for Plot 87 (should be empty initially)
SELECT 'Plot 87 Co-Owners:' as plot_info;
SELECT * FROM get_plot_co_owners_dynamic(5); -- Assuming Plot 87 is project ID 5

-- Step 4: Show current project mapping
SELECT '=== CURRENT PROJECT MAPPING ===' as info;
SELECT 
    p.id as project_id,
    p.title as plot_name,
    p.total_sqm as total_sqm,
    p.price_per_sqm as price_per_sqm,
    'Ready for co-ownership data' as status
FROM projects p
ORDER BY p.id;

-- Step 5: Show how it works for all plots
SELECT '=== HOW IT WORKS FOR ALL PLOTS ===' as info;
SELECT 
    'When ANY user buys SQM from ANY plot:' as step,
    '1. Investment is inserted into investments table' as action
UNION ALL SELECT 
    '2. get_plot_co_owners_dynamic(project_id) automatically includes the new purchase',
    '3. Available SQM automatically reduces for that specific plot'
UNION ALL SELECT 
    '4. Dashboard shows real-time updated co-ownership data for that plot',
    '5. Percentages are calculated based on actual purchases for that specific plot'
UNION ALL SELECT 
    '6. Works for Plot 77, 79, 81, 84, 87 and any future plots',
    '7. Each plot maintains its own independent co-ownership data'
UNION ALL SELECT 
    '8. When you add new plots/projects, they automatically work with this system',
    '9. No code changes needed for new plots - just add them to the projects table';
