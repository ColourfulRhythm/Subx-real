-- Verification Script for Referral System Schema
-- Run this after applying the main schema to verify everything is working

-- 1. Check if tables were created
SELECT 'Tables Check:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('referral_rewards', 'referral_audit_log')
ORDER BY table_name;

-- 2. Check if user_profiles has the new columns
SELECT 'User Profiles Columns Check:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('referral_code', 'referred_by', 'wallet_balance')
ORDER BY column_name;

-- 3. Check if functions were created
SELECT 'Functions Check:' as status;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%referral%'
ORDER BY routine_name;

-- 4. Test referral code generation
SELECT 'Referral Code Generation Test:' as status;
SELECT generate_referral_code() as test_code;

-- 5. Check if view was created
SELECT 'View Check:' as status;
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'top_referrers';

-- 6. Summary
SELECT 'Schema Verification Complete!' as status;
