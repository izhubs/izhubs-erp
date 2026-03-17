-- =============================================================
-- izhubs ERP — Migration 010: Tenant Module Activation
-- Created: 2026-03-17
-- Purpose: Track which modules are active per tenant.
--          "Installing" a module = setting is_active = true here.
--          All module DB tables use shared schema + tenant_id.
--          No runtime migrations needed on install.
-- =============================================================

CREATE TABLE IF NOT EXISTS tenant_modules (
  tenant_id    UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_id    VARCHAR(100) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  is_active    BOOLEAN      NOT NULL DEFAULT false,
  config       JSONB        NOT NULL DEFAULT '{}', -- module-specific config per tenant
  installed_at TIMESTAMP,                          -- NULL = never installed
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, module_id)
);

-- Pre-populate all modules for the default tenant (single-tenant mode)
-- CRM is active by default; others are inactive until explicitly installed
INSERT INTO tenant_modules (tenant_id, module_id, is_active, installed_at)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id,
  CASE WHEN id = 'crm' THEN true ELSE false END,
  CASE WHEN id = 'crm' THEN NOW() ELSE NULL END
FROM modules
ON CONFLICT (tenant_id, module_id) DO NOTHING;

-- Indexes for performance (checked on every API request)
CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant    ON tenant_modules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_active    ON tenant_modules(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_module    ON tenant_modules(module_id);
