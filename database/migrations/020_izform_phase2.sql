-- =============================================================
-- Migration 020: izForm Phase 2 — Webhooks & Lead Routing
-- Adds webhook_url and auto_convert_lead columns to iz_forms
-- =============================================================

ALTER TABLE iz_forms ADD COLUMN IF NOT EXISTS webhook_url TEXT DEFAULT NULL;
ALTER TABLE iz_forms ADD COLUMN IF NOT EXISTS auto_convert_lead BOOLEAN NOT NULL DEFAULT false;
