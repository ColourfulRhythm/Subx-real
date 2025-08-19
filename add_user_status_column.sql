-- Add missing is_active column to user_profiles table
-- This will make user status updates fully functional in the admin panel

-- Add the is_active column with default value true
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing users to have active status
UPDATE user_profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN user_profiles.is_active IS 'User account status: true = active, false = suspended';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'is_active';

-- Show current user statuses
SELECT 
    id,
    full_name,
    is_active,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;
