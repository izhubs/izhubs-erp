-- Migration 007: Add index on deals.stage for fast kanban column queries
-- Safe to run on existing data (IF NOT EXISTS guard)

CREATE INDEX IF NOT EXISTS idx_deals_stage
  ON deals(stage)
  WHERE deleted_at IS NULL;
