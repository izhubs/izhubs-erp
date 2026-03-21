-- ============================================================
-- Fix Dashboard Configs Unique Constraint
-- ============================================================

-- The previous constraint UNIQUE(tenant_id, slug) prevented us from having
-- different dashboard layouts for different roles on the same slug (e.g. 'main')
-- We drop it and replace it with a composite unique constraint involving role.

ALTER TABLE dashboard_configs 
  DROP CONSTRAINT IF EXISTS dashboard_configs_tenant_id_slug_key;

ALTER TABLE dashboard_configs 
  ADD CONSTRAINT dashboard_configs_tenant_slug_role_key UNIQUE (tenant_id, slug, role);
