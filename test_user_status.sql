-- Test script to verify user status functionality
-- Run this after applying add_user_status_column.sql

-- 1. Check if the column was added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'is_active';

-- 2. Show current user statuses
SELECT 
    id,
    full_name,
    is_active,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 3. Test updating a user status (optional - uncomment to test)
-- UPDATE user_profiles 
-- SET is_active = false 
-- WHERE full_name = 'Tolulope Olugbode';

-- 4. Verify the update worked
-- SELECT full_name, is_active FROM user_profiles WHERE full_name = 'Tolulope Olugbode';

-- 5. Reset back to active (optional - uncomment to reset)
-- UPDATE user_profiles 
-- SET is_active = true 
-- WHERE full_name = 'Tolulope Olugbode';
