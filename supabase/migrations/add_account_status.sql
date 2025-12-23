-- Add account status fields to profiles table
-- Run this in Supabase SQL Editor

-- Add account_status column (default 'active')
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended'));

-- Add account_suspended_reason column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS account_suspended_reason TEXT;

-- Add account_suspended_at column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS account_suspended_at TIMESTAMPTZ;

-- Create index for faster lookups of suspended accounts
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- Comment for documentation
COMMENT ON COLUMN profiles.account_status IS 'Account status: active or suspended (banned)';
COMMENT ON COLUMN profiles.account_suspended_reason IS 'Reason for suspension: refund, chargeback, etc.';
COMMENT ON COLUMN profiles.account_suspended_at IS 'Timestamp when account was suspended';
