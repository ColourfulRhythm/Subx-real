-- FIX MISSING PURCHASE - For users who bought but dashboard not updated
-- This script will find and fix any missing purchases

-- Step 1: Check for any pending investments that need to be processed
SELECT 'Checking for pending investments...' as status;

-- Look for investments with payment_reference but no plot_ownership
SELECT 
  i.id,
  i.user_id,
  i.payment_reference,
  i.sqm_purchased,
  i.amount,
  i.status,
  CASE 
    WHEN po.id IS NULL THEN 'MISSING PLOT OWNERSHIP'
    ELSE 'OK'
  END as status_check
FROM investments i
LEFT JOIN plot_ownership po ON i.user_id = po.user_id AND i.project_id = po.plot_id
WHERE i.payment_reference IS NOT NULL 
  AND i.status = 'completed'
  AND po.id IS NULL;

-- Step 2: Create missing plot ownership records
DO $$
DECLARE
  missing_investment RECORD;
BEGIN
  FOR missing_investment IN 
    SELECT 
      i.id,
      i.user_id,
      i.project_id,
      i.sqm_purchased,
      i.amount,
      i.payment_reference,
      p.title as plot_name,
      p.location
    FROM investments i
    LEFT JOIN plot_ownership po ON i.user_id = po.user_id AND i.project_id = po.plot_id
    JOIN projects p ON i.project_id = p.id
    WHERE i.payment_reference IS NOT NULL 
      AND i.status = 'completed'
      AND po.id IS NULL
  LOOP
    -- Insert missing plot ownership
    INSERT INTO plot_ownership (
      user_id, 
      plot_id, 
      sqm_owned, 
      amount_paid, 
      plot_name, 
      location,
      created_at
    ) VALUES (
      missing_investment.user_id,
      missing_investment.project_id,
      missing_investment.sqm_purchased,
      missing_investment.amount,
      missing_investment.plot_name,
      missing_investment.location,
      NOW()
    )
    ON CONFLICT (user_id, plot_id) DO UPDATE SET
      sqm_owned = plot_ownership.sqm_owned + missing_investment.sqm_purchased,
      amount_paid = plot_ownership.amount_paid + missing_investment.amount,
      updated_at = NOW();
    
    RAISE NOTICE 'Fixed missing plot ownership for user %: % sqm in %', 
      missing_investment.user_id, 
      missing_investment.sqm_purchased, 
      missing_investment.plot_name;
  END LOOP;
END $$;

-- Step 3: Verify the fix
SELECT 'Verifying fix...' as status;

SELECT 
  i.user_id,
  i.payment_reference,
  i.sqm_purchased,
  i.amount,
  po.sqm_owned,
  po.amount_paid,
  CASE 
    WHEN po.id IS NOT NULL THEN '✅ FIXED'
    ELSE '❌ STILL MISSING'
  END as status
FROM investments i
LEFT JOIN plot_ownership po ON i.user_id = po.user_id AND i.project_id = po.plot_id
WHERE i.payment_reference IS NOT NULL 
  AND i.status = 'completed';

-- Step 4: Check user portfolio totals
SELECT 'Checking user portfolio totals...' as status;

SELECT 
  au.email,
  COALESCE(SUM(po.sqm_owned), 0) as total_sqm,
  COALESCE(SUM(po.amount_paid), 0) as total_amount,
  COUNT(po.id) as plot_count
FROM auth.users au
LEFT JOIN plot_ownership po ON au.id = po.user_id
WHERE au.email IN (
  'chrixonuoha@gmail.com',
  'kingkwaoyama@gmail.com', 
  'mary.stella82@yahoo.com',
  'kingflamebeats@gmail.com'
)
GROUP BY au.id, au.email
ORDER BY total_sqm DESC;

-- Step 5: Summary
SELECT 'Fix completed! Check results above.' as final_status;
