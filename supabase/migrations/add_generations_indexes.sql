-- Add indexes to generations table for better query performance
-- These indexes improve performance for common queries

-- Index for user_id (most queries filter by user)
CREATE INDEX IF NOT EXISTS idx_generations_user_id 
ON public.generations(user_id);

-- Index for status (used in process routes to find pending/processing)
CREATE INDEX IF NOT EXISTS idx_generations_status 
ON public.generations(status);

-- Index for tool (used to filter by tool type)
CREATE INDEX IF NOT EXISTS idx_generations_tool 
ON public.generations(tool);

-- Composite index for common query pattern: user_id + tool + status
-- This covers queries like "get all processing sora2 generations for user"
CREATE INDEX IF NOT EXISTS idx_generations_user_tool_status 
ON public.generations(user_id, tool, status);

-- Index for created_at (used for ordering and time-based queries)
CREATE INDEX IF NOT EXISTS idx_generations_created_at 
ON public.generations(created_at DESC);

-- Composite index for user_id + created_at (common for getting recent generations)
CREATE INDEX IF NOT EXISTS idx_generations_user_created 
ON public.generations(user_id, created_at DESC);

-- Index for workflow_id (if filtering by workflow)
CREATE INDEX IF NOT EXISTS idx_generations_workflow_id 
ON public.generations(workflow_id) 
WHERE workflow_id IS NOT NULL;

COMMENT ON INDEX idx_generations_user_id IS 'Improves queries filtering by user_id';
COMMENT ON INDEX idx_generations_status IS 'Improves queries filtering by status';
COMMENT ON INDEX idx_generations_tool IS 'Improves queries filtering by tool type';
COMMENT ON INDEX idx_generations_user_tool_status IS 'Composite index for common query pattern';
COMMENT ON INDEX idx_generations_created_at IS 'Improves ordering by creation date';
COMMENT ON INDEX idx_generations_user_created IS 'Composite index for user recent generations';
COMMENT ON INDEX idx_generations_workflow_id IS 'Partial index for workflow-based queries';
