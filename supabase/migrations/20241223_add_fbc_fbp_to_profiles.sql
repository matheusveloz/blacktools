-- Add fbc and fbp columns to profiles for Facebook attribution
-- These cookies are set when user clicks on a Facebook ad
-- fbc = Facebook Click ID (links purchase to specific ad click)
-- fbp = Facebook Browser ID (identifies the browser)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fbc TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fbp TEXT DEFAULT NULL;

-- Create index for faster lookups (optional but good for analytics)
CREATE INDEX IF NOT EXISTS idx_profiles_fbc ON profiles(fbc) WHERE fbc IS NOT NULL;
