-- Add has_used_trial column to profiles table
-- This tracks whether a user has already used their one-time trial

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- Update existing users who have/had subscriptions to mark trial as used
UPDATE profiles
SET has_used_trial = TRUE
WHERE subscription_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.has_used_trial IS 'Tracks if user has used their one-time trial. Once true, user cannot get another trial.';
