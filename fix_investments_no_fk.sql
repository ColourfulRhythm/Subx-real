-- Fix Investments Data for Subx Application
-- This script works around foreign key constraints

-- First, let's check what we have
SELECT '=== CURRENT STATE ===' as info;
SELECT COUNT(*) as investments_count FROM investments;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;

-- Check if we have any real users in auth.users
SELECT '=== AUTH USERS ===' as info;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- For now, let's create a simple solution without foreign key constraints
-- We'll insert the data directly and handle the foreign key issue later

-- First, let's see if we can disable the foreign key constraint temporarily
-- (This might not work in Supabase, so we'll try a different approach)

-- Let's check the current project data
SELECT '=== CURRENT PROJECT DATA ===' as info;
SELECT id, title, total_sqm FROM projects WHERE id = 1;

-- Update the project to have 500 sqm
UPDATE projects 
SET total_sqm = 500 
WHERE id = 1 AND title LIKE '%Plot 77%';

-- For now, let's create a simple test to see if we can insert without foreign keys
-- We'll use a different approach - create the data in a way that doesn't violate constraints

-- Let's check if there are any existing users we can use
SELECT '=== CHECKING FOR EXISTING USERS ===' as info;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- If we have users, let's use the first one as a test
-- Otherwise, we'll need to create a different solution

-- For now, let's just update the project data and create a note about the foreign key issue
SELECT '=== PROJECT UPDATED ===' as info;
SELECT 
    p.title,
    p.total_sqm as total_sqm,
    'Foreign key constraint prevents investment insertion' as note
FROM projects p
WHERE p.id = 1;
