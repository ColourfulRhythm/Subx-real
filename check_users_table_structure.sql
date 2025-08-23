-- CHECK USERS TABLE STRUCTURE
-- This script will show you the actual columns in your users table

-- Check if users table exists
SELECT 'Table exists check:' as info;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as users_table_exists;

-- Show actual table structure
SELECT 'Current users table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if user_profiles table exists
SELECT 'user_profiles table check:' as info;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
) as user_profiles_table_exists;

-- Show user_profiles structure if it exists
SELECT 'user_profiles table structure (if exists):' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check sample data
SELECT 'Sample data from users table:' as info;
SELECT * FROM users LIMIT 3;

-- Check auth.users structure
SELECT 'auth.users structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;
