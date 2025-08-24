-- VERIFY: Check what's actually in the plot_ownership table
-- This will help us understand why the dashboard still shows empty co-owners

-- 1. Check total records in plot_ownership
SELECT 'Total records in plot_ownership:' as info;
SELECT COUNT(*) as total_records FROM plot_ownership;

-- 2. Check what plot IDs exist
SELECT 'Plot IDs in plot_ownership:' as info;
SELECT DISTINCT plot_id FROM plot_ownership ORDER BY plot_id;

-- 3. Check the structure of plot_ownership table
SELECT 'Plot_ownership table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'plot_ownership' 
ORDER BY ordinal_position;

-- 4. Show all plot ownership data
SELECT 'All plot ownership data:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    po.created_at,
    au.email as auth_user_email
FROM plot_ownership po
LEFT JOIN auth.users au ON po.user_id = au.id
ORDER BY po.plot_id, po.sqm_owned DESC;

-- 5. Check specific plot ID 2
SELECT 'Plot ID 2 ownership data:' as info;
SELECT 
    po.plot_id,
    po.user_id,
    po.sqm_owned,
    po.amount_paid,
    po.created_at,
    au.email as auth_user_email
FROM plot_ownership po
LEFT JOIN auth.users au ON po.user_id = au.id
WHERE po.plot_id = 2
ORDER BY po.sqm_owned DESC;

-- 6. Check if there are any constraints or triggers
SELECT 'Constraints on plot_ownership:' as info;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'plot_ownership';

-- 7. Check if the data is actually committed
SELECT 'Current transaction status:' as info;
SELECT txid_current() as current_transaction_id;
