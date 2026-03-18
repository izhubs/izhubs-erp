-- =============================================================
-- izhubs ERP — Migration 009: Tenant Automations
-- Stores configurable automation rules per tenant.
-- Rules are seeded from IndustryTemplate.automations[] on tenant setup.
-- Users can edit/disable them via Settings > Automation (never hardcoded).
-- =============================================================

CREATE TABLE IF NOT EXISTS tenant_automations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  -- Trigger: what event fires this automation
  trigger      TEXT NOT NULL,                     -- e.g. 'deal.stage_changed'
  -- Condition: evaluated against trigger payload (simple string expression)
  condition    TEXT NOT NULL DEFAULT 'true',       -- e.g. "toStage == 'renewal'"
  -- Action: what happens
  action       TEXT NOT NULL,                     -- e.g. 'create_activity'
  -- Action config: flexible JSON payload for the action
  action_config JSONB NOT NULL DEFAULT '{}',      -- { "type": "task", "subject": "...", "daysFromNow": 0 }
  -- State
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tenant_automations_tenant_idx ON tenant_automations(tenant_id);
CREATE INDEX IF NOT EXISTS tenant_automations_trigger_idx ON tenant_automations(tenant_id, trigger) WHERE is_active = TRUE;

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_tenant_automations_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tenant_automations_updated_at ON tenant_automations;
CREATE TRIGGER tenant_automations_updated_at
  BEFORE UPDATE ON tenant_automations
  FOR EACH ROW EXECUTE FUNCTION update_tenant_automations_updated_at();
