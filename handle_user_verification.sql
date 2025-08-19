-- Handle User Verification and Update Records
-- Run this when users actually sign up and verify their profiles

-- Function to update user records when they verify
CREATE OR REPLACE FUNCTION handle_user_verification_update()
RETURNS trigger AS $$
BEGIN
    -- When a new user is created in auth.users, update the placeholder records
    -- This function will be called by the trigger we'll create
    
    -- Check if this user's email matches any of our placeholder users
    IF NEW.email = 'chrixonuoha@gmail.com' THEN
        -- Update Christopher Onuoha's records
        UPDATE user_profiles 
        SET id = NEW.id, 
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', 'Christopher Onuoha'),
            phone = COALESCE(NEW.raw_user_meta_data->>'phone', '+234 801 234 5678')
        WHERE id = '11111111-1111-1111-1111-111111111111';
        
        UPDATE investments 
        SET user_id = NEW.id 
        WHERE user_id = '11111111-1111-1111-1111-111111111111';
        
        UPDATE forum_replies 
        SET user_id = NEW.id 
        WHERE user_id = '11111111-1111-1111-1111-111111111111';
        
    ELSIF NEW.email = 'kingkwaoyama@gmail.com' THEN
        -- Update Kingkwa Enang Oyama's records
        UPDATE user_profiles 
        SET id = NEW.id, 
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', 'Kingkwa Enang Oyama'),
            phone = COALESCE(NEW.raw_user_meta_data->>'phone', '+234 802 345 6789')
        WHERE id = '22222222-2222-2222-2222-222222222222';
        
        UPDATE investments 
        SET user_id = NEW.id 
        WHERE user_id = '22222222-2222-2222-2222-222222222222';
        
        UPDATE forum_replies 
        SET user_id = NEW.id 
        WHERE user_id = '22222222-2222-2222-2222-222222222222';
        
    ELSIF NEW.email = 'mary.stella82@yahoo.com' THEN
        -- Update Iwuozor Chika's records
        UPDATE user_profiles 
        SET id = NEW.id, 
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', 'Iwuozor Chika'),
            phone = COALESCE(NEW.raw_user_meta_data->>'phone', '+234 803 456 7890')
        WHERE id = '33333333-3333-3333-3333-333333333333';
        
        UPDATE investments 
        SET user_id = NEW.id 
        WHERE user_id = '33333333-3333-3333-3333-333333333333';
        
        UPDATE forum_replies 
        SET user_id = NEW.id 
        WHERE user_id = '33333333-3333-3333-3333-333333333333';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update records when users verify
CREATE OR REPLACE TRIGGER on_user_verification
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_user_verification_update();

-- Manual update function (run this manually if needed)
CREATE OR REPLACE FUNCTION manual_update_user_records(user_email TEXT, new_user_id UUID)
RETURNS void AS $$
BEGIN
    IF user_email = 'chrixonuoha@gmail.com' THEN
        UPDATE user_profiles SET id = new_user_id WHERE id = '11111111-1111-1111-1111-111111111111';
        UPDATE investments SET user_id = new_user_id WHERE user_id = '11111111-1111-1111-1111-111111111111';
        UPDATE forum_replies SET user_id = new_user_id WHERE user_id = '11111111-1111-1111-1111-111111111111';
    ELSIF user_email = 'kingkwaoyama@gmail.com' THEN
        UPDATE user_profiles SET id = new_user_id WHERE id = '22222222-2222-2222-2222-222222222222';
        UPDATE investments SET user_id = new_user_id WHERE user_id = '22222222-2222-2222-2222-222222222222';
        UPDATE forum_replies SET user_id = new_user_id WHERE user_id = '22222222-2222-2222-2222-222222222222';
    ELSIF user_email = 'mary.stella82@yahoo.com' THEN
        UPDATE user_profiles SET id = new_user_id WHERE id = '33333333-3333-3333-3333-333333333333';
        UPDATE investments SET user_id = new_user_id WHERE user_id = '33333333-3333-3333-3333-333333333333';
        UPDATE forum_replies SET user_id = new_user_id WHERE user_id = '33333333-3333-3333-3333-333333333333';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage of manual update (run this when users verify):
-- SELECT manual_update_user_records('chrixonuoha@gmail.com', 'actual-user-uuid-here');
