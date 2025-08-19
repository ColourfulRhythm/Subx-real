-- Check and fix Tolulope's investment if they've already signed up
-- Run this in Supabase SQL Editor

-- First, let's check if Tolulope exists in the system
SELECT '=== CHECKING IF TOLULOPE EXISTS ===' as info;

-- Check if Tolulope exists in user_profiles
SELECT 'Tolulope in user_profiles:' as status;
SELECT 
    up.id,
    up.full_name,
    au.email,
    up.phone,
    up.created_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.email = 'kingflamebeats@gmail.com' 
   OR up.full_name ILIKE '%Tolulope%' 
   OR up.full_name ILIKE '%Olugbode%';

-- Check if Tolulope exists in auth.users
SELECT 'Tolulope in auth.users:' as status;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'kingflamebeats@gmail.com';

-- Check if Tolulope has any investments
SELECT 'Tolulope investments:' as status;
SELECT 
    i.id,
    i.project_id,
    i.sqm_purchased,
    i.amount,
    i.status,
    p.title as project_title,
    up.full_name,
    au.email
FROM investments i
LEFT JOIN projects p ON i.project_id = p.id
LEFT JOIN user_profiles up ON i.user_id = up.id
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.email = 'kingflamebeats@gmail.com' 
   OR up.full_name ILIKE '%Tolulope%'
   OR up.full_name ILIKE '%Olugbode%';

-- Check if there are any orphaned investments for Tolulope (investments without user_id)
SELECT 'Orphaned investments for Tolulope:' as status;
SELECT 
    i.id,
    i.project_id,
    i.sqm_purchased,
    i.amount,
    i.status,
    p.title as project_title
FROM investments i
LEFT JOIN projects p ON i.project_id = p.id
WHERE i.user_id IS NULL 
   OR i.user_id NOT IN (SELECT id FROM user_profiles);

-- Now let's fix Tolulope's investment if needed
-- Step 1: If Tolulope exists in user_profiles but not linked to investment
DO $$
DECLARE
    tolulope_user_id UUID;
    plot77_project_id INTEGER;
BEGIN
    -- Get Tolulope's user ID
    SELECT id INTO tolulope_user_id 
    FROM user_profiles 
    WHERE email = 'kingflamebeats@gmail.com';
    
    -- Get Plot 77 project ID
    SELECT id INTO plot77_project_id 
    FROM projects 
    WHERE title LIKE '%Plot 77%';
    
    -- If Tolulope exists but has no investment, create one
    IF tolulope_user_id IS NOT NULL AND plot77_project_id IS NOT NULL THEN
        -- Check if investment already exists
        IF NOT EXISTS (
            SELECT 1 FROM investments 
            WHERE user_id = tolulope_user_id AND project_id = plot77_project_id
        ) THEN
            -- Create the investment
            INSERT INTO investments (
                user_id, 
                project_id, 
                sqm_purchased, 
                amount, 
                status, 
                created_at
            ) VALUES (
                tolulope_user_id, 
                plot77_project_id, 
                1, 
                5000.00, 
                'completed', 
                NOW()
            );
            
            RAISE NOTICE 'Created investment for Tolulope: 1 sqm in Plot 77';
        ELSE
            RAISE NOTICE 'Tolulope already has an investment in Plot 77';
        END IF;
    ELSE
        IF tolulope_user_id IS NULL THEN
            RAISE NOTICE 'Tolulope not found in user_profiles';
        END IF;
        IF plot77_project_id IS NULL THEN
            RAISE NOTICE 'Plot 77 not found in projects';
        END IF;
    END IF;
END $$;

-- Step 2: If Tolulope exists in auth.users but not in user_profiles, create profile
DO $$
DECLARE
    tolulope_auth_id UUID;
    plot77_project_id INTEGER;
BEGIN
    -- Get Tolulope's auth ID
    SELECT id INTO tolulope_auth_id 
    FROM auth.users 
    WHERE email = 'kingflamebeats@gmail.com';
    
    -- Get Plot 77 project ID
    SELECT id INTO plot77_project_id 
    FROM projects 
    WHERE title LIKE '%Plot 77%';
    
    -- If Tolulope exists in auth.users but not in user_profiles
    IF tolulope_auth_id IS NOT NULL AND plot77_project_id IS NOT NULL THEN
        -- Create user profile if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM user_profiles WHERE id = tolulope_auth_id
        ) THEN
            INSERT INTO user_profiles (
                id,
                full_name,
                email,
                phone,
                user_type,
                created_at
            ) VALUES (
                tolulope_auth_id,
                'Tolulope Olugbode',
                'kingflamebeats@gmail.com',
                '+2348034567890',
                'investor',
                NOW()
            );
            
            RAISE NOTICE 'Created user profile for Tolulope';
            
            -- Now create the investment
            INSERT INTO investments (
                user_id, 
                project_id, 
                sqm_purchased, 
                amount, 
                status, 
                created_at
            ) VALUES (
                tolulope_auth_id, 
                plot77_project_id, 
                1, 
                5000.00, 
                'completed', 
                NOW()
            );
            
            RAISE NOTICE 'Created investment for Tolulope: 1 sqm in Plot 77';
        END IF;
    END IF;
END $$;

-- Final verification
SELECT '=== FINAL VERIFICATION ===' as info;

-- Check Tolulope's final status
SELECT 'Tolulope final status:' as status;
SELECT 
    up.id,
    up.full_name,
    up.email,
    up.phone,
    up.user_type,
    up.created_at
FROM user_profiles up
WHERE up.email = 'kingflamebeats@gmail.com';

-- Check Tolulope's final investment
SELECT 'Tolulope final investment:' as status;
SELECT 
    i.id,
    i.project_id,
    i.sqm_purchased,
    i.amount,
    i.status,
    p.title as project_title,
    up.full_name,
    au.email
FROM investments i
LEFT JOIN projects p ON i.project_id = p.id
LEFT JOIN user_profiles up ON i.user_id = up.id
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.email = 'kingflamebeats@gmail.com';

-- Show updated Plot 77 co-ownership
SELECT '=== UPDATED PLOT 77 CO-OWNERSHIP ===' as info;
SELECT 
    COALESCE(up.full_name, 'Unknown User') as user_name,
    i.sqm_purchased,
    i.amount,
    ROUND((i.sqm_purchased::DECIMAL / 500::DECIMAL) * 100, 1) as ownership_percentage
FROM investments i
LEFT JOIN user_profiles up ON i.user_id = up.id
WHERE i.project_id = 1 AND i.status = 'completed'
ORDER BY i.amount DESC;

-- Show available SQM for Plot 77
SELECT '=== PLOT 77 AVAILABLE SQM ===' as info;
SELECT 
    p.title,
    p.total_sqm as total_sqm,
    COALESCE(SUM(i.sqm_purchased), 0) as purchased_sqm,
    (p.total_sqm - COALESCE(SUM(i.sqm_purchased), 0)) as available_sqm
FROM projects p
LEFT JOIN investments i ON p.id = i.project_id AND i.status = 'completed'
WHERE p.id = 1
GROUP BY p.id, p.title, p.total_sqm;
