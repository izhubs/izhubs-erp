-- =============================================================
-- izhubs ERP — Migration 008: Add Tenant ID (Multi-tenant prep)
-- Created: 2026-03-16
-- Purpose: Future-proof schema for managed cloud (v0.3).
--          Single-tenant mode = tenant_id = 1 (default).
--          Activate multi-tenant in v0.3 by assigning real tenant IDs.
-- =============================================================

-- Create tenants table first
CREATE TABLE IF NOT EXISTS tenants (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  plan        VARCHAR(50)  NOT NULL DEFAULT 'self-hosted'
                CHECK (plan IN ('self-hosted', 'starter', 'pro', 'enterprise')),
  settings    JSONB        NOT NULL DEFAULT '{}',
  active      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Insert default tenant (single-tenant mode)
INSERT INTO tenants (id, name, slug, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default', 'default', 'self-hosted')
ON CONFLICT DO NOTHING;

-- Add tenant_id to all core tables (nullable now, NOT NULL after v0.3 migration)
ALTER TABLE users      ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE companies  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE contacts   ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE deals      ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE custom_field_definitions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';

-- Backfill existing rows
UPDATE users      SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE companies  SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE contacts   SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE deals      SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE activities SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE custom_field_definitions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- Indexes for tenant filtering (critical for multi-tenant query performance)
CREATE INDEX IF NOT EXISTS idx_users_tenant      ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant  ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant   ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_tenant      ON deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant ON activities(tenant_id);
