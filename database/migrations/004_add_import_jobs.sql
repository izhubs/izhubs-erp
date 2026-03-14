-- =============================================================
-- Migration 004: Data import jobs
-- =============================================================
CREATE TABLE IF NOT EXISTS import_jobs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(50)  NOT NULL DEFAULT 'csv',
  entity_type VARCHAR(20)  NOT NULL,  -- contacts | deals | companies
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','processing','done','failed')),
  filename    VARCHAR(255),
  total_rows  INTEGER      DEFAULT 0,
  imported    INTEGER      DEFAULT 0,
  failed      INTEGER      DEFAULT 0,
  errors      JSONB        DEFAULT '[]',
  created_by  UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);
