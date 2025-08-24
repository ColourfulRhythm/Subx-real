-- CHECK: What table does plot_ownership.user_id actually reference?
-- This will solve the foreign key constraint mystery

-- 1. Check the exact foreign key constraint
SELECT 'Foreign key constraint details:' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    ccu.table_schema AS foreign_schema_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'plot_ownership'
    AND kcu.column_name = 'user_id';

-- 2. Check if auth.users exists and has data
SELECT 'Checking auth.users table:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
) as auth_users_exists;

-- 3. Check what's in auth.users if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'users'
    ) THEN
        RAISE NOTICE 'auth.users exists - checking its structure and data';
    ELSE
        RAISE NOTICE 'auth.users does NOT exist';
    END IF;
END $$;

-- 4. Check public.users table structure
SELECT 'Public users table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check public.user_profiles table structure
SELECT 'Public user_profiles table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Show sample data from public.users
SELECT 'Sample data from public.users:' as info;
SELECT id, email, full_name FROM users LIMIT 5;

-- 7. Show sample data from public.user_profiles
SELECT 'Sample data from public.user_profiles:' as info;
SELECT id, email, full_name FROM user_profiles LIMIT 5;

-- 8. Check if there are any other user-related tables
SELECT 'Other user-related tables:' as info;
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
AND table_schema IN ('public', 'auth')
ORDER BY table_schema, table_name;
