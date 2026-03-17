-- =============================================================
-- izhubs ERP — Migration 003: Industry Theme & Nav Engine
-- Adds multi-industry layout engine support to the tenants table.
-- industry_templates is the runtime source of truth for nav/dashboard config.
-- .ts template files serve as seed data only (run seed:industry-templates once).
-- =============================================================

-- ---- Add industry + custom branding columns to tenants ----
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS industry           VARCHAR(100),
  ADD COLUMN IF NOT EXISTS custom_theme_config JSONB NOT NULL DEFAULT '{}';

-- industry: maps to industry_templates.id (e.g. 'restaurant', 'spa')
-- custom_theme_config: CSS variable overrides for white-label / custom branding
--   example: { "--color-primary": "#e91e8c", "--color-primary-hover": "#c2185b" }
--   These are injected as inline styles and override the industry's themeDefaults.

-- ---- Industry Templates table ----
-- Seeded from templates/industry/*.ts via `npm run seed:industry-templates`
-- Updated at runtime by tenant settings UI (triggers revalidateTag cache bust)
CREATE TABLE IF NOT EXISTS industry_templates (
  id               VARCHAR(100) PRIMARY KEY,    -- 'restaurant', 'spa', 'agency', etc.
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  icon             VARCHAR(10),
  category         VARCHAR(50)  NOT NULL DEFAULT 'other'
                     CHECK (category IN ('hospitality', 'retail', 'services', 'technology', 'real_estate', 'other')),
  -- Sidebar + Dashboard JSON — consumed by Sidebar.tsx and DashboardGrid.tsx
  nav_config       JSONB        NOT NULL DEFAULT '{}',
  -- per-industry default CSS variable overrides (override :root tokens)
  theme_defaults   JSONB        NOT NULL DEFAULT '{}',
  -- requiredModules: module ids to activate during onboarding ONLY
  -- After setup, tenant_modules table is the sole source of truth
  required_modules JSONB        NOT NULL DEFAULT '[]',
  version          VARCHAR(50)  NOT NULL DEFAULT '1.0.0',
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS idx_tenants_industry ON tenants(industry);
CREATE INDEX IF NOT EXISTS idx_industry_templates_category ON industry_templates(category);
