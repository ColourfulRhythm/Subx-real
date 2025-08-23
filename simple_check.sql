-- SIMPLE CHECK: Basic table information
-- This will definitely show results

-- 1. Check what tables exist
SELECT 'Tables in database:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check plot_ownership structure
SELECT 'Plot_ownership columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'plot_ownership';

-- 3. Check users table structure  
SELECT 'Users table columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users';

-- 4. Check user_profiles table structure
SELECT 'User_profiles table columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- 5. Check foreign key constraints
SELECT 'Foreign keys on plot_ownership:' as info;
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'plot_ownership';

-- 6. Check data counts
SELECT 'Data counts:' as info;
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'plot_ownership' as table_name, COUNT(*) as count FROM plot_ownership;
