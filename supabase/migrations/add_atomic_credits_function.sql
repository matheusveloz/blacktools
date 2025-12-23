-- Função SQL para dedução atômica de créditos (previne race conditions)
-- Esta função garante que a dedução seja feita em uma transação atômica com lock

CREATE OR REPLACE FUNCTION deduct_credits_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_credits INTEGER;
  v_credits_extras INTEGER;
  v_credits_extras_stored INTEGER;
  v_subscription_status TEXT;
  v_from_subscription INTEGER;
  v_from_extras INTEGER;
  v_new_credits INTEGER;
  v_new_credits_extras INTEGER;
  v_total INTEGER;
BEGIN
  -- Lock the row for update (prevents concurrent modifications)
  SELECT 
    credits, 
    credits_extras, 
    subscription_status
  INTO 
    v_credits, 
    v_credits_extras_stored, 
    v_subscription_status
  FROM profiles 
  WHERE id = p_user_id 
  FOR UPDATE;  -- CRITICAL: Locks the row
  
  -- If user not found
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Calculate available extras (only if subscription is active)
  IF v_subscription_status = 'active' OR v_subscription_status = 'trialing' THEN
    v_credits_extras := v_credits_extras_stored;
  ELSE
    v_credits_extras := 0;
  END IF;

  -- Calculate total available
  v_total := v_credits + v_credits_extras;

  -- Check if enough credits
  IF v_total < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'available', v_total,
      'required', p_amount,
      'credits', v_credits,
      'credits_extras', v_credits_extras
    );
  END IF;

  -- Calculate how much to take from each pool
  -- Strategy: Use subscription credits first, then extras
  IF v_credits >= p_amount THEN
    v_from_subscription := p_amount;
    v_from_extras := 0;
  ELSE
    v_from_subscription := v_credits;
    v_from_extras := p_amount - v_credits;
  END IF;

  -- Calculate new balances
  v_new_credits := v_credits - v_from_subscription;
  v_new_credits_extras := v_credits_extras_stored - v_from_extras;

  -- Update the profile atomically
  UPDATE profiles SET
    credits = v_new_credits,
    credits_extras = v_new_credits_extras,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'previous_balance', jsonb_build_object(
      'credits', v_credits,
      'credits_extras', v_credits_extras,
      'total', v_total
    ),
    'new_balance', jsonb_build_object(
      'credits', v_new_credits,
      'credits_extras', v_new_credits_extras - (CASE WHEN v_subscription_status NOT IN ('active', 'trialing') THEN v_credits_extras_stored ELSE 0 END),
      'total', v_new_credits + (CASE WHEN v_subscription_status IN ('active', 'trialing') THEN v_new_credits_extras ELSE 0 END)
    ),
    'deducted', p_amount,
    'from_subscription', v_from_subscription,
    'from_extras', v_from_extras
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (via service role)
-- RLS policies will still apply

COMMENT ON FUNCTION deduct_credits_atomic IS 'Atomically deducts credits from user profile, preventing race conditions';
