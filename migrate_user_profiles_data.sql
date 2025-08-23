-- MIGRATE DATA FROM user_profiles TO users TABLE
-- This script will move all existing referral data to the unified users table

-- Step 1: Check what data exists in user_profiles
SELECT 'Current user_profiles data:' as info;
SELECT COUNT(*) as total_records FROM user_profiles;
SELECT COUNT(*) as records_with_referral_codes FROM user_profiles WHERE referral_code IS NOT NULL;
SELECT COUNT(*) as records_with_wallet_balance FROM user_profiles WHERE wallet_balance > 0;

-- Step 2: Check what data exists in users table
SELECT 'Current users table data:' as info;
SELECT COUNT(*) as total_records FROM users;
SELECT COUNT(*) as records_with_referral_codes FROM users WHERE referral_code IS NOT NULL;
SELECT COUNT(*) as records_with_wallet_balance FROM users WHERE wallet_balance > 0;

-- Step 3: Migrate referral data from user_profiles to users
UPDATE users u 
SET 
  referral_code = up.referral_code,
  wallet_balance = COALESCE(up.wallet_balance, 0.00),
  referred_by = up.referred_by,
  is_verified = COALESCE(up.is_verified, false),
  verification_date = up.verification_date
FROM user_profiles up 
WHERE u.id = up.id
  AND (up.referral_code IS NOT NULL OR up.wallet_balance > 0 OR up.referred_by IS NOT NULL OR up.is_verified = true);

-- Step 4: Generate referral codes for users who don't have them
UPDATE users 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- Step 5: Verify the migration
SELECT 'After migration - users table:' as info;
SELECT COUNT(*) as total_records FROM users;
SELECT COUNT(*) as records_with_referral_codes FROM users WHERE referral_code IS NOT NULL;
SELECT COUNT(*) as records_with_wallet_balance FROM users WHERE wallet_balance > 0;
SELECT COUNT(*) as verified_users FROM users WHERE is_verified = true;

-- Step 6: Show sample of migrated data
SELECT 'Sample migrated data:' as info;
SELECT 
  id,
  email,
  full_name,
  referral_code,
  wallet_balance,
  is_verified,
  verification_date
FROM users 
WHERE referral_code IS NOT NULL 
  OR wallet_balance > 0 
  OR is_verified = true
LIMIT 10;

-- Step 7: Check for any orphaned user_profiles records
SELECT 'Orphaned user_profiles records (no matching user):' as info;
SELECT COUNT(*) as orphaned_count
FROM user_profiles up
LEFT JOIN users u ON up.id = u.id
WHERE u.id IS NULL;

-- Final status
SELECT '🎉 DATA MIGRATION COMPLETED!' as final_status;
