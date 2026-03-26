-- Migration: Add dedupe_hash to progress_logs
-- Purpose: Enable robust idempotency protection via unique constraint.

ALTER TABLE progress_logs 
ADD COLUMN IF NOT EXISTS dedupe_hash TEXT UNIQUE;

-- Optional: Index for cleanup or monitoring
CREATE INDEX IF NOT EXISTS idx_progress_logs_dedupe_hash ON progress_logs(dedupe_hash);

-- Correcting any past logs (optional/no-op for new projects)
COMMENT ON COLUMN progress_logs.dedupe_hash IS 'Hash generated from (user_id, activity_id, amount, 5s_bucket) to prevent duplicate submissions.';
