-- =============================================================
-- Migration 005: GDPR / Right to Erasure (Phase 1.4)
-- Adds anonymized_at column to users table.
-- Anonymized users cannot log in and all PII is wiped.
-- =============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_anonymized ON users(anonymized_at) WHERE anonymized_at IS NOT NULL;
