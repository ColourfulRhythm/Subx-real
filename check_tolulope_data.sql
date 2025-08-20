-- CHECK TOLULOPE DATA - Find out what's happening
-- This will show us why Tolulope has 4 sqm but others have 0

-- Step 1: Check what Tolulope actually has
SELECT 
  'Tolulope Data' as check_type,
  au.email,
  po.plot_name,
  po.sqm_owned,
  po.amount_paid,
  po.plot_id,
  p.title as project_title
FROM auth.users au
JOIN plot_ownership po ON au.id = po.user_id
JOIN projects p ON po.plot_id = p.id
WHERE au.email LIKE '%tolulope%';

-- Step 2: Check what project Tolulope is linked to
SELECT 
  'Tolulope Project' as check_type,
  p.id,
  p.title,
  p.location,
  p.total_sqm,
  p.status
FROM projects p
JOIN plot_ownership po ON p.id = po.plot_id
JOIN auth.users au ON po.user_id = au.id
WHERE au.email LIKE '%tolulope%';

-- Step 3: Check if our target users exist with exact emails
SELECT 
  'Target Users Check' as check_type,
  au.email,
  au.id,
  au.created_at,
  CASE 
    WHEN up.id IS NOT NULL THEN 'Has Profile'
    ELSE 'No Profile'
  END as profile_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com');

-- Step 4: Check if there are any similar emails (typos)
SELECT 
  'Similar Emails' as check_type,
  au.email,
  au.id
FROM auth.users au
WHERE au.email LIKE '%kingflame%' 
   OR au.email LIKE '%chrixonuoha%'
   OR au.email LIKE '%kingkwaoyama%'
   OR au.email LIKE '%mary.stella%'
   OR au.email LIKE '%stella82%';

-- Step 5: Check what projects exist that might match
SELECT 
  'Available Projects' as check_type,
  p.id,
  p.title,
  p.location,
  p.total_sqm,
  p.status
FROM projects p
WHERE p.title ILIKE '%plot%' 
   OR p.title ILIKE '%2 seasons%'
   OR p.title ILIKE '%seasons%'
   OR p.title ILIKE '%gbako%'
   OR p.title ILIKE '%ogun%';

-- Step 6: Check current plot_ownership for all users
SELECT 
  'All Ownership Data' as check_type,
  au.email,
  po.plot_name,
  po.sqm_owned,
  po.amount_paid,
  po.plot_id,
  p.title as project_title
FROM auth.users au
LEFT JOIN plot_ownership po ON au.id = po.user_id
LEFT JOIN projects p ON po.plot_id = p.id
WHERE au.email IN ('kingflamebeats@gmail.com', 'chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com')
   OR au.email LIKE '%tolulope%'
ORDER BY au.email;
