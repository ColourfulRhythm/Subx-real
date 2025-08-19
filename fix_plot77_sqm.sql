-- Fix Plot 77 SQM and Investments
-- Update Plot 77 to have 500 sqm total (not 1000)

-- First, update the project data
UPDATE projects 
SET total_sqm = 500 
WHERE id = 1 AND title LIKE '%Plot 77%';

-- Clear existing investments for Plot 77
DELETE FROM investments WHERE project_id = 1;

-- Insert corrected investments (total should be 500 sqm)
INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at) VALUES
-- Christopher Onuoha - 7 sqm in Plot 77 (5000 * 7 = 35000)
('11111111-1111-1111-1111-111111111111', 1, 7, 35000.00, 'completed', 'CHRIS_ONUOHA_001', NOW()),
-- Kingkwa Enang Oyama - 35 sqm in Plot 77 (5000 * 35 = 175000)
('22222222-2222-2222-2222-222222222222', 1, 35, 175000.00, 'completed', 'KINGKWA_OYAMA_001', NOW()),
-- Iwuozor Chika - 7 sqm in Plot 77 (5000 * 7 = 35000)
('33333333-3333-3333-3333-333333333333', 1, 7, 35000.00, 'completed', 'IWUOZOR_CHIKA_001', NOW())
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT '=== UPDATED PLOT 77 DATA ===' as info;
SELECT 
    p.title,
    p.total_sqm as total_sqm,
    COALESCE(SUM(i.sqm_purchased), 0) as purchased_sqm,
    (p.total_sqm - COALESCE(SUM(i.sqm_purchased), 0)) as available_sqm
FROM projects p
LEFT JOIN investments i ON p.id = i.project_id AND i.status = 'completed'
WHERE p.id = 1
GROUP BY p.id, p.title, p.total_sqm;

-- Show co-ownership data
SELECT '=== CO-OWNERSHIP DATA FOR PLOT 77 ===' as info;
SELECT 
    up.full_name,
    i.sqm_purchased,
    i.amount,
    ROUND((i.amount / SUM(i.amount) OVER()) * 100, 1) as ownership_percentage
FROM investments i
JOIN user_profiles up ON i.user_id = up.id
WHERE i.project_id = 1 AND i.status = 'completed'
ORDER BY i.amount DESC;

-- Show all investment details
SELECT '=== ALL INVESTMENT DETAILS ===' as info;
SELECT 
    i.id,
    up.full_name,
    i.sqm_purchased,
    i.amount,
    i.status,
    p.title as project_title
FROM investments i
JOIN user_profiles up ON i.user_id = up.id
JOIN projects p ON i.project_id = p.id;
