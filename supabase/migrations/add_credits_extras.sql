-- Migration: Add credits_extras column to profiles table
-- This column stores extra credits purchased by users (separate from subscription credits)

-- Add the credits_extras column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS credits_extras INTEGER NOT NULL DEFAULT 0;

-- Add a check constraint to ensure credits_extras is never negative
ALTER TABLE public.profiles
ADD CONSTRAINT credits_extras_non_negative CHECK (credits_extras >= 0);

-- Create index for faster queries on credits
CREATE INDEX IF NOT EXISTS idx_profiles_credits_extras ON public.profiles(credits_extras);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.credits_extras IS 'Extra credits purchased by the user (separate from monthly subscription credits)';
