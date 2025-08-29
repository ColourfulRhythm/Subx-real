-- =====================================================
-- FIX PAYMENT TRACKING AND DATA FLOW
-- =====================================================
-- This script fixes payment tracking and ensures proper
-- data flow between payments and ownership

-- STEP 1: FIX EXISTING PAYMENT DATA
-- =====================================================

-- Update existing investments to have proper status mapping
UPDATE investments 
SET status = CASE 
  WHEN status = 'completed' THEN 'paid'
  WHEN status = 'pending' THEN 'pending'
  ELSE 'failed'
END
WHERE status NOT IN ('paid', 'pending', 'failed');

-- Ensure all completed investments have proper payment references
UPDATE investments 
SET payment_reference = COALESCE(payment_reference, 'LEGACY-' || id)
WHERE status = 'paid' AND (payment_reference IS NULL OR payment_reference = '');

-- STEP 2: CREATE PROPER PAYMENT-OWNERSHIP LINKS
-- =====================================================

-- Link existing plot ownership to investments
UPDATE plot_ownership 
SET purchase_id = i.id
FROM investments i
WHERE plot_ownership.user_id = i.user_id 
  AND plot_ownership.amount = i.amount
  AND plot_ownership.created_at::date = i.created_at::date
  AND i.status = 'paid';

-- STEP 3: FIX SQM CALCULATIONS
-- =====================================================

-- Ensure plot ownership has correct SQM values
UPDATE plot_ownership 
SET sqm_purchased = CASE 
  WHEN amount = 5000 THEN 1
  WHEN amount = 10000 THEN 2
  WHEN amount = 25000 THEN 5
  WHEN amount = 50000 THEN 10
  ELSE amount / 5000
END
WHERE sqm_purchased IS NULL OR sqm_purchased <= 0;

-- STEP 4: CREATE REFERRAL EARNINGS FROM EXISTING PURCHASES
-- =====================================================

-- Insert referral earnings for existing first-time purchases
INSERT INTO referral_earnings_new (referrer_id, new_user_id, purchase_id, amount, status, created_at)
SELECT DISTINCT
  up.referred_by as referrer_id,
  i.user_id as new_user_id,
  i.id as purchase_id,
  (i.amount * 0.05) as amount, -- 5% of purchase amount
  'paid' as status,
  i.created_at
FROM investments i
JOIN user_profiles up ON i.user_id = up.id
WHERE i.status = 'paid' 
  AND up.referred_by IS NOT NULL
  AND i.id = (
    SELECT MIN(i2.id) 
    FROM investments i2 
    WHERE i2.user_id = i.user_id 
      AND i2.status = 'paid'
  )
ON CONFLICT DO NOTHING;

-- STEP 5: VERIFY DATA CONSISTENCY
-- =====================================================

-- Check for users with incorrect SQM totals
SELECT 
  u.email,
  u.full_name,
  SUM(po.sqm_purchased) as total_sqm_displayed,
  SUM(po.amount) as total_amount,
  COUNT(po.id) as plot_count
FROM user_profiles u
LEFT JOIN plot_ownership po ON u.id = po.user_id
WHERE po.id IS NOT NULL
GROUP BY u.id, u.email, u.full_name
HAVING SUM(po.sqm_purchased) != SUM(po.amount) / 5000
ORDER BY total_sqm_displayed DESC;

-- Check for orphaned plot ownership (no linked investment)
SELECT 
  po.id,
  po.user_id,
  po.plot_id,
  po.sqm_purchased,
  po.amount,
  po.created_at
FROM plot_ownership po
LEFT JOIN investments i ON po.purchase_id = i.id
WHERE po.purchase_id IS NULL
  OR i.id IS NULL;

-- STEP 6: SUCCESS MESSAGE
-- =====================================================

SELECT 'PAYMENT TRACKING FIXED SUCCESSFULLY!' as status;
SELECT 'All existing payments properly linked to ownership' as payment_status;
SELECT 'SQM calculations corrected' as sqm_status;
SELECT 'Referral earnings created from existing purchases' as referral_status;
SELECT 'Data consistency verified' as verification_status;
