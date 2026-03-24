-- =============================================================
-- Migration 025: izLanding Analytics & Event Tracking
-- Tables: iz_landing_analytics
-- =============================================================

CREATE TABLE IF NOT EXISTS iz_landing_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES iz_landing_projects(id) ON DELETE CASCADE,
  event_type      VARCHAR(50) NOT NULL, -- e.g., 'view', 'click', 'submit'
  session_id      VARCHAR(255),         -- IP hash or unique visitor ID
  user_agent      TEXT,
  event_data      JSONB NOT NULL DEFAULT '{}', -- UTMs, Element IDs, URL, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iz_landing_analytics_project_type ON iz_landing_analytics(project_id, event_type);
CREATE INDEX IF NOT EXISTS idx_iz_landing_analytics_tenant ON iz_landing_analytics(tenant_id);
