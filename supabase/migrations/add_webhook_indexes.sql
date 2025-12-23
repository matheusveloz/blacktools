-- Add indexes to speed up webhook queries
-- These indexes help the Stripe webhook find users quickly

-- Index for stripe_customer_id (used to find user by Stripe customer)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Index for email (used as fallback to find user)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Index for subscription_id (used to find existing subscriptions)
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id);
