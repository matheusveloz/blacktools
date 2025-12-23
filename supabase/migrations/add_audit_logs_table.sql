-- Audit logs table for security and compliance
-- Tracks important actions performed by users

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user_id (common query pattern)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON public.audit_logs(user_id);

-- Index for action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON public.audit_logs(action);

-- Index for created_at (for time-based queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON public.audit_logs(created_at DESC);

-- Composite index for user + action + time
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_created 
ON public.audit_logs(user_id, action, created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write audit logs (no public access)
-- Application uses createAdminClient which bypasses RLS

-- Optional: Function to cleanup old audit logs (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.audit_logs IS 'Audit trail of important user actions for security and compliance';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Removes audit logs older than 1 year';
