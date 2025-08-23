-- CHECK: Table relationships and foreign key constraints
-- This will help us understand why the foreign key constraint is failing

-- 1. Check what tables exist
SELECT 'Available tables:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check plot_ownership table structure
SELECT 'Plot_ownership table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'plot_ownership'
ORDER BY ordinal_position;

-- 3. Check foreign key constraints on plot_ownership
SELECT 'Foreign key constraints on plot_ownership:' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
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

-- 4. Check what's in the users table that plot_ownership references
SELECT 'Users table that plot_ownership references:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'users';

-- 5. Check the actual users table structure
SELECT 'Users table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 6. Check if there's a user_profiles table
SELECT 'User_profiles table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 7. Check what data exists in each table
SELECT 'Users table data count:' as info;
SELECT COUNT(*) as total_users FROM users;

SELECT 'User_profiles table data count:' as info;
SELECT COUNT(*) as total_user_profiles FROM user_profiles;

SELECT 'Plot_ownership table data count:' as info;
SELECT COUNT(*) as total_plot_ownership FROM plot_ownership;

-- 8. Check sample data from users table
SELECT 'Sample users data:' as info;
SELECT id, email, full_name, created_at FROM users ORDER BY created_at LIMIT 5;

-- 9. Check if plot_ownership table exists and has data
SELECT 'Plot_ownership table exists:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'plot_ownership'
) as table_exists;
