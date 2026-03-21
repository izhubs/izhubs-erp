-- =============================================================
-- izhubs ERP — Seed Data (System Defaults)
-- Created: 2026-03-17
-- Purpose: Populate required system-level data after schema creation.
--          This file is idempotent (ON CONFLICT DO NOTHING).
--
-- Contains:
--   1. Default tenant (single-tenant self-hosted mode)
--   2. Official module registry
--   3. Default tenant → module activation (CRM on by default)
-- =============================================================

-- 1. Default tenant (single-tenant mode = tenant_id = 00000000-...-0001)
INSERT INTO tenants (id, name, slug, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default', 'default', 'self-hosted')
ON CONFLICT DO NOTHING;

-- 2. Official modules (catalog — not activated until user installs)
INSERT INTO modules (id, name, description, version, category, icon, is_official) VALUES
  ('crm',          'CRM Pipeline',  'Manage deals pipeline and contacts. Kanban drag-drop.',            '1.0.0', 'core',       '📊', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Pre-populate default tenant modules (CRM active by default, rest = inactive)
INSERT INTO tenant_modules (tenant_id, module_id, is_active, installed_at)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id,
  CASE WHEN id = 'crm' THEN true ELSE false END,
  CASE WHEN id = 'crm' THEN NOW() ELSE NULL END
FROM modules
ON CONFLICT (tenant_id, module_id) DO NOTHING;
