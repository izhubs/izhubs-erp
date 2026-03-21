-- ============================================================
-- DASHBOARD CONFIGS (Dynamic Dashboard Engine)
-- ============================================================
CREATE TABLE IF NOT EXISTS dashboard_configs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'member'
                CHECK (role IN ('superadmin', 'admin', 'manager', 'member', 'viewer')),
  is_default  BOOLEAN      NOT NULL DEFAULT false,
  layout_json JSONB        NOT NULL DEFAULT '{"layout_id": "default", "grid": []}',
  created_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_dashboard_configs_tenant_role ON dashboard_configs(tenant_id, role);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_layout_gin ON dashboard_configs USING GIN (layout_json jsonb_path_ops);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dashboard_configs_tenant_isolation ON dashboard_configs;
CREATE POLICY dashboard_configs_tenant_isolation ON dashboard_configs AS PERMISSIVE FOR ALL 
USING (
  COALESCE(current_setting('app.current_tenant_id', true), '') = '' OR 
  tenant_id::text = current_setting('app.current_tenant_id', true)
);

-- ============================================================
-- TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS dashboard_configs_updated_at ON dashboard_configs;
CREATE TRIGGER dashboard_configs_updated_at 
  BEFORE UPDATE ON dashboard_configs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();
