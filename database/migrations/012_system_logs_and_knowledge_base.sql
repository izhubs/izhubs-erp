-- ============================================================
-- MIGRATION 012: System Logs & Knowledge Base
-- Required for robust error tracking and self-serve help center
-- ============================================================

-- 1. SYSTEM LOGS
-- Core system logs for developer tracing (API errors, UI tracking)
CREATE TABLE IF NOT EXISTS system_logs (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  level       VARCHAR(20)   NOT NULL DEFAULT 'info' 
                CHECK (level IN ('info', 'warn', 'error', 'fatal', 'debug')),
  context     VARCHAR(100),
  message     TEXT          NOT NULL,
  meta        JSONB         NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

-- 2. KNOWLEDGE BASE CATEGORIES
CREATE TABLE IF NOT EXISTS kb_categories (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  name        VARCHAR(255)  NOT NULL,
  slug        VARCHAR(255)  NOT NULL,
  icon        VARCHAR(50),
  parent_id   UUID          REFERENCES kb_categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- 3. KNOWLEDGE BASE ARTICLES
CREATE TABLE IF NOT EXISTS kb_articles (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  category_id UUID          REFERENCES kb_categories(id) ON DELETE SET NULL,
  title       VARCHAR(255)  NOT NULL,
  slug        VARCHAR(255)  NOT NULL,
  content     TEXT,
  status      VARCHAR(20)   NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published', 'archived')),
  author_id   UUID          REFERENCES users(id) ON DELETE SET NULL,
  metadata    JSONB         NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Note: In a true global SaaS, KB might be global. 
-- For IZhubs, we scope it to tenant so each tenant can have their internal KB, 
-- or we use the default tenant (000...01) for global IZhubs KB.

CREATE INDEX IF NOT EXISTS idx_kb_articles_tenant_status ON kb_articles(tenant_id, status);

-- Enable RLS for these tenant-scoped tables
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kb_categories_tenant_isolation ON kb_categories;
CREATE POLICY kb_categories_tenant_isolation ON kb_categories AS PERMISSIVE FOR ALL USING (COALESCE(current_setting('app.current_tenant_id', true), '') = '' OR tenant_id::text = current_setting('app.current_tenant_id', true));

ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kb_articles_tenant_isolation ON kb_articles;
CREATE POLICY kb_articles_tenant_isolation ON kb_articles AS PERMISSIVE FOR ALL USING (COALESCE(current_setting('app.current_tenant_id', true), '') = '' OR tenant_id::text = current_setting('app.current_tenant_id', true));
