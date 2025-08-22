-- FIX MISSING PURCHASE - For users who bought but dashboard not updated
-- This script will find and fix any missing purchases

-- Step 1: Check for any pending investments that need to be processed
DO $$
BEGIN
  RAISE NOTICE 'Checking for pending investments...';
END $$;

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
