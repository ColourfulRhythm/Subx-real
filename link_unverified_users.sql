-- Link Unverified Users to Their Investments When They Sign Up
-- This script should be run after users actually sign up and verify their profiles

-- Function to link unverified user investments when they sign up
CREATE OR REPLACE FUNCTION link_unverified_user_investments()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is one of our unverified users
    IF NEW.email IN ('chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com') THEN
        -- Create user profile
        INSERT INTO user_profiles (id, full_name, phone, email, created_at)
        VALUES (
            NEW.id,
            CASE 
                WHEN NEW.email = 'chrixonuoha@gmail.com' THEN 'Christopher Onuoha'
                WHEN NEW.email = 'kingkwaoyama@gmail.com' THEN 'Kingkwa Enang Oyama'
                WHEN NEW.email = 'mary.stella82@yahoo.com' THEN 'Iwuozor Chika'
            END,
            CASE 
                WHEN NEW.email = 'chrixonuoha@gmail.com' THEN '+234 801 234 5678'
                WHEN NEW.email = 'kingkwaoyama@gmail.com' THEN '+234 802 345 6789'
                WHEN NEW.email = 'mary.stella82@yahoo.com' THEN '+234 803 456 7890'
            END,
            NEW.email,
            NEW.created_at
        ) ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email;

        -- Create investment record
        INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at)
        VALUES (
            NEW.id,
            1, -- Plot 77
            CASE 
                WHEN NEW.email = 'chrixonuoha@gmail.com' THEN 7
                WHEN NEW.email = 'kingkwaoyama@gmail.com' THEN 35
                WHEN NEW.email = 'mary.stella82@yahoo.com' THEN 7
            END,
            CASE 
                WHEN NEW.email = 'chrixonuoha@gmail.com' THEN 35000.00
                WHEN NEW.email = 'kingkwaoyama@gmail.com' THEN 175000.00
                WHEN NEW.email = 'mary.stella82@yahoo.com' THEN 35000.00
            END,
            'completed',
            CASE 
                WHEN NEW.email = 'chrixonuoha@gmail.com' THEN 'CHRIS_ONUOHA_001'
                WHEN NEW.email = 'kingkwaoyama@gmail.com' THEN 'KINGKWA_OYAMA_001'
                WHEN NEW.email = 'mary.stella82@yahoo.com' THEN 'IWUOZOR_CHIKA_001'
            END,
            NEW.created_at
        ) ON CONFLICT DO NOTHING;

        -- Link forum topics and replies to this user
        UPDATE forum_topics 
        SET user_id = NEW.id 
        WHERE user_id IS NULL 
        AND id IN (1, 2, 3, 4, 5);

        UPDATE forum_replies 
        SET user_id = NEW.id 
        WHERE user_id IS NULL 
        AND id IN (1, 2, 3, 4);

        RAISE NOTICE 'Linked unverified user % to their investments and forum activity', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically link users when they sign up
DROP TRIGGER IF EXISTS link_unverified_users_trigger ON auth.users;
CREATE TRIGGER link_unverified_users_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION link_unverified_user_investments();

-- Manual linking function (can be called manually if needed)
CREATE OR REPLACE FUNCTION manually_link_unverified_user(user_email VARCHAR, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if this is one of our unverified users
    IF user_email IN ('chrixonuoha@gmail.com', 'kingkwaoyama@gmail.com', 'mary.stella82@yahoo.com') THEN
        -- Create user profile
        INSERT INTO user_profiles (id, full_name, phone, email, created_at)
        VALUES (
            user_uuid,
            CASE 
                WHEN user_email = 'chrixonuoha@gmail.com' THEN 'Christopher Onuoha'
                WHEN user_email = 'kingkwaoyama@gmail.com' THEN 'Kingkwa Enang Oyama'
                WHEN user_email = 'mary.stella82@yahoo.com' THEN 'Iwuozor Chika'
            END,
            CASE 
                WHEN user_email = 'chrixonuoha@gmail.com' THEN '+234 801 234 5678'
                WHEN user_email = 'kingkwaoyama@gmail.com' THEN '+234 802 345 6789'
                WHEN user_email = 'mary.stella82@yahoo.com' THEN '+234 803 456 7890'
            END,
            user_email,
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email;

        -- Create investment record
        INSERT INTO investments (user_id, project_id, sqm_purchased, amount, status, payment_reference, created_at)
        VALUES (
            user_uuid,
            1, -- Plot 77
            CASE 
                WHEN user_email = 'chrixonuoha@gmail.com' THEN 7
                WHEN user_email = 'kingkwaoyama@gmail.com' THEN 35
                WHEN user_email = 'mary.stella82@yahoo.com' THEN 7
            END,
            CASE 
                WHEN user_email = 'chrixonuoha@gmail.com' THEN 35000.00
                WHEN user_email = 'kingkwaoyama@gmail.com' THEN 175000.00
                WHEN user_email = 'mary.stella82@yahoo.com' THEN 35000.00
            END,
            'completed',
            CASE 
                WHEN user_email = 'chrixonuoha@gmail.com' THEN 'CHRIS_ONUOHA_001'
                WHEN user_email = 'kingkwaoyama@gmail.com' THEN 'KINGKWA_OYAMA_001'
                WHEN user_email = 'mary.stella82@yahoo.com' THEN 'IWUOZOR_CHIKA_001'
            END,
            NOW()
        ) ON CONFLICT DO NOTHING;

        -- Link forum topics and replies to this user
        UPDATE forum_topics 
        SET user_id = user_uuid 
        WHERE user_id IS NULL 
        AND id IN (1, 2, 3, 4, 5);

        UPDATE forum_replies 
        SET user_id = user_uuid 
        WHERE user_id IS NULL 
        AND id IN (1, 2, 3, 4);

        RAISE NOTICE 'Manually linked unverified user % to their investments and forum activity', user_email;
    ELSE
        RAISE EXCEPTION 'Email % is not in the list of unverified users', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Show the current status
SELECT '=== LINKING FUNCTIONS CREATED ===' as info;
SELECT 'Functions created:' as status
UNION ALL
SELECT '- link_unverified_user_investments() - Automatic trigger function'
UNION ALL
SELECT '- manually_link_unverified_user() - Manual linking function'
UNION ALL
SELECT '- Trigger created on auth.users table';

-- Show how to use the manual function
SELECT '=== MANUAL LINKING INSTRUCTIONS ===' as info;
SELECT 'To manually link a user, run:' as instruction
UNION ALL
SELECT 'SELECT manually_link_unverified_user(''chrixonuoha@gmail.com'', ''USER_UUID_HERE'');'
UNION ALL
SELECT 'SELECT manually_link_unverified_user(''kingkwaoyama@gmail.com'', ''USER_UUID_HERE'');'
UNION ALL
SELECT 'SELECT manually_link_unverified_user(''mary.stella82@yahoo.com'', ''USER_UUID_HERE'');';

-- Show what will happen when users sign up
SELECT '=== AUTOMATIC LINKING WHEN USERS SIGN UP ===' as info;
SELECT 'When these users sign up, they will automatically get:' as description
UNION ALL
SELECT '- User profile with their name and phone'
UNION ALL
SELECT '- Investment record for Plot 77'
UNION ALL
SELECT '- Forum topics and replies linked to their account'
UNION ALL
SELECT '- Co-ownership percentage calculated automatically';
