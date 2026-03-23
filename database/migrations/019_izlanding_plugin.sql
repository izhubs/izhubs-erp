-- =============================================================
-- Migration 019: izLanding Plugin
-- Tables: iz_landing_projects, iz_landing_pages, iz_landing_domains, iz_landing_generation_logs
-- =============================================================

CREATE TABLE IF NOT EXISTS iz_landing_projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  active_domain VARCHAR(255),
  status      VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_iz_landing_projects_tenant ON iz_landing_projects(tenant_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS iz_landing_pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES iz_landing_projects(id) ON DELETE CASCADE,
  content_json     JSONB NOT NULL DEFAULT '{}',
  tracking_scripts JSONB NOT NULL DEFAULT '[]',
  is_published     BOOLEAN NOT NULL DEFAULT false,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iz_landing_pages_project ON iz_landing_pages(project_id);

CREATE TABLE IF NOT EXISTS iz_landing_domains (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES iz_landing_projects(id) ON DELETE CASCADE,
  domain        VARCHAR(255) NOT NULL UNIQUE,
  ssl_status    VARCHAR(50) NOT NULL DEFAULT 'pending',
  cloudflare_id VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iz_landing_domains_project ON iz_landing_domains(project_id);

CREATE TABLE IF NOT EXISTS iz_landing_generation_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  prompt      TEXT NOT NULL,
  token_usage INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iz_landing_gen_logs_tenant ON iz_landing_generation_logs(tenant_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS iz_landing_projects_updated_at ON iz_landing_projects;
CREATE TRIGGER iz_landing_projects_updated_at BEFORE UPDATE ON iz_landing_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS iz_landing_pages_updated_at ON iz_landing_pages;
CREATE TRIGGER iz_landing_pages_updated_at BEFORE UPDATE ON iz_landing_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed izlanding plugin into modules catalog
INSERT INTO modules (id, name, description, version, category, icon, is_official, config_schema)
VALUES (
  'izlanding',
  'izLanding — AI Landing Pages',
  'AI-powered Landing Page Builder using Zero-JS Astro framework. Type a prompt and get a blazing fast responsive page.',
  '1.0.0',
  'operations',
  '🚀',
  true,
  '{}'
) ON CONFLICT (id) DO NOTHING;
