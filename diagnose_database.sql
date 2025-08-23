-- DIAGNOSTIC: Check what's actually in your database
-- This will help us understand why plot ownership insert is failing

-- 1. Check what tables exist
SELECT 'Available tables:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check users table structure and data
SELECT 'Users table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';

SELECT 'Users table data:' as info;
SELECT * FROM users LIMIT 10;

-- 3. Check user_profiles table structure and data
SELECT 'User_profiles table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

SELECT 'User_profiles table data:' as info;
SELECT * FROM user_profiles LIMIT 10;

-- 4. Check plot_ownership table structure
SELECT 'Plot_ownership table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'plot_ownership';

-- 5. Check if plot_ownership table exists and has data
SELECT 'Plot_ownership table data:' as info;
SELECT COUNT(*) as total_records FROM plot_ownership;

-- 6. Test the user ID lookups that are failing
SELECT 'Testing user ID lookups:' as info;

SELECT 'Looking for kingflamebeats@gmail.com:' as test;
SELECT id, email, full_name FROM users WHERE email = 'kingflamebeats@gmail.com';

SELECT 'Looking for benjaminchisom1@gmail.com:' as test;
SELECT id, email, full_name FROM users WHERE email = 'benjaminchisom1@gmail.com';

SELECT 'Looking for chrixonuoha@gmail.com:' as test;
SELECT id, email, full_name FROM users WHERE email = 'chrixonuoha@gmail.com';

SELECT 'Looking for kingkwaoyama@gmail.com:' as test;
SELECT id, email, full_name FROM users WHERE email = 'kingkwaoyama@gmail.com';

SELECT 'Looking for mary.stella82@yahoo.com:' as test;
SELECT id, email, full_name FROM users WHERE email = 'mary.stella82@yahoo.com';

SELECT 'Looking for michelleunachukwu@gmail.com:' as test;
SELECT id, email, full_name FROM users WHERE email = 'michelleunachukwu@gmail.com';

-- 7. Check what emails actually exist in users table
SELECT 'Available emails in users table:' as info;
SELECT email, full_name FROM users ORDER BY created_at;

-- 8. Check what emails actually exist in user_profiles table
SELECT 'Available emails in user_profiles table:' as info;
SELECT email, full_name FROM user_profiles ORDER BY created_at;
