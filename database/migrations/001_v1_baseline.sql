-- ==========================================
-- From: 001_initial_schema.sql
-- ==========================================
-- =============================================================
-- izhubs ERP — Initial Schema (Squashed)
-- This is the single source of truth for the database schema.
-- Squashed from migrations 001–010 for a clean fresh-install experience.
-- =============================================================

-- Enable UUID generation and FTS extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Immutable unaccent wrapper for FTS (required for use in indexes & triggers)
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
  RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$$SELECT public.unaccent('unaccent'::regdictionary, $1)$$;

-- ============================================================
-- TENANTS (multi-tenant foundation, single-tenant default)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(100) NOT NULL UNIQUE,
  plan                VARCHAR(50)  NOT NULL DEFAULT 'self-hosted'
                        CHECK (plan IN ('self-hosted', 'starter', 'pro', 'enterprise')),
  settings            JSONB        NOT NULL DEFAULT '{}',
  active              BOOLEAN      NOT NULL DEFAULT true,
  industry            VARCHAR(100),
  custom_theme_config JSONB        NOT NULL DEFAULT '{}',
  created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDUSTRY TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS industry_templates (
  id               VARCHAR(100) PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  icon             VARCHAR(10),
  category         VARCHAR(50)  NOT NULL DEFAULT 'other'
                     CHECK (category IN ('hospitality', 'retail', 'services', 'technology', 'real_estate', 'other')),
  nav_config       JSONB        NOT NULL DEFAULT '{}',
  theme_defaults   JSONB        NOT NULL DEFAULT '{}',
  required_modules JSONB        NOT NULL DEFAULT '[]',
  version          VARCHAR(50)  NOT NULL DEFAULT '1.0.0',
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  name              VARCHAR(255) NOT NULL DEFAULT '',
  email             VARCHAR(255) NOT NULL UNIQUE,
  role              VARCHAR(50)  NOT NULL DEFAULT 'member'
                      CHECK (role IN ('superadmin', 'admin', 'member', 'viewer')),
  password_hash     VARCHAR(255),
  avatar_url        TEXT,
  active            BOOLEAN      NOT NULL DEFAULT true,
  theme_preference  VARCHAR(20)  DEFAULT 'indigo',
  language          VARCHAR(10)  DEFAULT 'en',
  timezone          VARCHAR(50)  DEFAULT 'Asia/Ho_Chi_Minh',
  date_format       VARCHAR(20)  DEFAULT 'DD/MM/YYYY',
  anonymized_at     TIMESTAMPTZ,
  created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  name          VARCHAR(255) NOT NULL,
  website       VARCHAR(255),
  industry      VARCHAR(100),
  country       VARCHAR(10),
  city          VARCHAR(100),
  address       TEXT,
  custom_fields JSONB        NOT NULL DEFAULT '{}',
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(50),
  title         VARCHAR(255),
  company_id    UUID         REFERENCES companies(id) ON DELETE SET NULL,
  owner_id      UUID         REFERENCES users(id) ON DELETE SET NULL,
  status        VARCHAR(20)  DEFAULT 'lead',
  search_vector tsvector,
  custom_fields JSONB        NOT NULL DEFAULT '{}',
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICE PACKAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS service_packages (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,
  description TEXT,
  price       NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency    TEXT          NOT NULL DEFAULT 'VND',
  billing     TEXT          NOT NULL DEFAULT 'monthly'
    CHECK (billing IN ('monthly', 'yearly', 'one_time')),
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ============================================================
-- DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS deals (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  name          VARCHAR(255)  NOT NULL,
  value         DECIMAL(15,2) NOT NULL DEFAULT 0,
  stage         VARCHAR(50)   NOT NULL DEFAULT 'new'
                  CHECK (stage IN ('new','contacted','qualified','proposal','negotiation','won','lost',
                                   'lead','onboarding','active','renewal')),
  contact_id    UUID          REFERENCES contacts(id) ON DELETE SET NULL,
  company_id    UUID          REFERENCES companies(id) ON DELETE SET NULL,
  owner_id      UUID          REFERENCES users(id) ON DELETE SET NULL,
  package_id    UUID          REFERENCES service_packages(id) ON DELETE SET NULL,
  search_vector tsvector,
  closed_at     TIMESTAMP,
  custom_fields JSONB         NOT NULL DEFAULT '{}',
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  type          VARCHAR(20)  NOT NULL
                  CHECK (type IN ('call','email','meeting','note','task')),
  subject       VARCHAR(255) NOT NULL,
  body          TEXT,
  due_at        TIMESTAMP,
  completed_at  TIMESTAMP,
  contact_id    UUID         REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id       UUID         REFERENCES deals(id) ON DELETE CASCADE,
  company_id    UUID         REFERENCES companies(id) ON DELETE CASCADE,
  owner_id      UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('contact', 'deal', 'company')),
  entity_id   UUID NOT NULL,
  author_id   UUID,
  content     TEXT NOT NULL,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOM FIELD DEFINITIONS (tenant-scoped)
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  entity_type   VARCHAR(20)  NOT NULL
                  CHECK (entity_type IN ('contact','company','deal','activity')),
  key           VARCHAR(100) NOT NULL,
  label         VARCHAR(255) NOT NULL,
  type          VARCHAR(20)  NOT NULL
                  CHECK (type IN ('text','number','date','boolean','select','multiselect','url','email','phone')),
  options       JSONB,
  required      BOOLEAN      NOT NULL DEFAULT false,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, entity_type, key)
);

-- ============================================================
-- WEBHOOKS & DELIVERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  url         TEXT         NOT NULL,
  events      JSONB        NOT NULL DEFAULT '[]',
  secret      VARCHAR(255),
  active      BOOLEAN      NOT NULL DEFAULT true,
  created_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id   UUID         REFERENCES webhooks(id) ON DELETE CASCADE,
  event        VARCHAR(100) NOT NULL,
  payload      JSONB        NOT NULL DEFAULT '{}',
  status_code  INTEGER,
  response     TEXT,
  success      BOOLEAN      NOT NULL DEFAULT false,
  delivered_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- IMPORT JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS import_jobs (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID         REFERENCES tenants(id) ON DELETE CASCADE,
  type           VARCHAR(50)  NOT NULL DEFAULT 'csv',
  entity_type    VARCHAR(20)  NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','processing','done','failed')),
  filename       VARCHAR(255),
  column_mapping JSONB        NOT NULL DEFAULT '{}',
  raw_sample     JSONB        NOT NULL DEFAULT '[]',
  total_rows     INTEGER      DEFAULT 0,
  imported       INTEGER      DEFAULT 0,
  failed         INTEGER      DEFAULT 0,
  errors         JSONB        DEFAULT '[]',
  created_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMP
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   UUID,
  before      JSONB        DEFAULT '{}',
  after       JSONB        DEFAULT '{}',
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MODULE REGISTRY
-- ============================================================
CREATE TABLE IF NOT EXISTS modules (
  id            VARCHAR(100) PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  version       VARCHAR(50)  NOT NULL DEFAULT '1.0.0',
  category      VARCHAR(100) NOT NULL
                  CHECK (category IN ('core', 'finance', 'operations', 'communication')),
  icon          VARCHAR(10),
  is_official   BOOLEAN      NOT NULL DEFAULT true,
  config_schema JSONB        NOT NULL DEFAULT '{}',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_modules (
  tenant_id    UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_id    VARCHAR(100) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  is_active    BOOLEAN      NOT NULL DEFAULT false,
  config       JSONB        NOT NULL DEFAULT '{}',
  installed_at TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, module_id)
);

-- ============================================================
-- TENANT AUTOMATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS tenant_automations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  trigger      TEXT NOT NULL,
  condition    TEXT NOT NULL DEFAULT 'true',
  action       TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UNIVERSAL EXTENSIBILITY LAYER
-- ============================================================
CREATE TABLE IF NOT EXISTS universal_records (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type         VARCHAR(100) NOT NULL,
  name         VARCHAR(255),
  status       VARCHAR(50),
  payload      JSONB        NOT NULL DEFAULT '{}',
  owner_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  contact_id   UUID         REFERENCES contacts(id) ON DELETE SET NULL,
  company_id   UUID         REFERENCES companies(id) ON DELETE SET NULL,
  deal_id      UUID         REFERENCES deals(id) ON DELETE SET NULL,
  deleted_at   TIMESTAMP,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS record_links (
  source_id     UUID         NOT NULL,
  target_id     UUID         NOT NULL,
  relation_type VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  PRIMARY KEY (source_id, target_id, relation_type)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_tenant          ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_anonymized      ON users(anonymized_at) WHERE anonymized_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_tenant      ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant       ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status       ON contacts(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deals_tenant          ON deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant     ON activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_tenant    ON import_jobs(tenant_id);

CREATE INDEX IF NOT EXISTS idx_contacts_company      ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner        ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact         ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company         ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner           ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage           ON deals(stage) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_contact    ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal       ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_owner_due  ON activities(owner_id, due_at);

CREATE INDEX IF NOT EXISTS idx_notes_entity          ON notes(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_tenant          ON notes(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_created         ON notes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_deleted      ON contacts(deleted_at)   WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_deleted         ON deals(deleted_at)      WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_deleted     ON companies(deleted_at)  WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_deleted    ON activities(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_log_user        ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity      ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created     ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);

CREATE INDEX IF NOT EXISTS idx_tenants_industry      ON tenants(industry);
CREATE INDEX IF NOT EXISTS idx_industry_templates_category ON industry_templates(category);

CREATE INDEX IF NOT EXISTS service_packages_tenant_idx ON service_packages(tenant_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS tenant_automations_tenant_idx ON tenant_automations(tenant_id);
CREATE INDEX IF NOT EXISTS tenant_automations_trigger_idx ON tenant_automations(tenant_id, trigger) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_modules_category      ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_is_official   ON modules(is_official);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON tenant_modules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_active ON tenant_modules(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_module ON tenant_modules(module_id);

CREATE INDEX IF NOT EXISTS idx_universal_records_tenant  ON universal_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_universal_records_type    ON universal_records(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_universal_records_owner   ON universal_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_universal_records_contact ON universal_records(contact_id);

-- Advanced JSONB Indexing (GIN + jsonb_path_ops) for hyper-fast payload querying
CREATE INDEX IF NOT EXISTS idx_universal_records_payload_gin ON universal_records USING GIN (payload jsonb_path_ops);

-- FTS Indexes
CREATE INDEX IF NOT EXISTS contacts_search_idx ON contacts USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS deals_search_idx ON deals USING GIN (search_vector);

-- ============================================================
-- TRIGGERS
-- ============================================================
-- 1. FTS Triggers
CREATE OR REPLACE FUNCTION contacts_search_vector_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', immutable_unaccent(COALESCE(NEW.name,  '')) || ' ' || immutable_unaccent(COALESCE(NEW.email, '')) || ' ' || immutable_unaccent(COALESCE(NEW.title, ''))); RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS contacts_search_vector_trig ON contacts;
CREATE TRIGGER contacts_search_vector_trig BEFORE INSERT OR UPDATE OF name, email, title ON contacts FOR EACH ROW EXECUTE FUNCTION contacts_search_vector_update();

CREATE OR REPLACE FUNCTION deals_search_vector_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', immutable_unaccent(COALESCE(NEW.name,  '')) || ' ' || immutable_unaccent(COALESCE(NEW.stage, ''))); RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS deals_search_vector_trig ON deals;
CREATE TRIGGER deals_search_vector_trig BEFORE INSERT OR UPDATE OF name, stage ON deals FOR EACH ROW EXECUTE FUNCTION deals_search_vector_update();

-- 2. Updated_at Triggers for tables without auto-updates via framework
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now(); RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_packages_updated_at ON service_packages;
CREATE TRIGGER service_packages_updated_at BEFORE UPDATE ON service_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS tenant_automations_updated_at ON tenant_automations;
CREATE TRIGGER tenant_automations_updated_at BEFORE UPDATE ON tenant_automations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS universal_records_updated_at ON universal_records;
CREATE TRIGGER universal_records_updated_at BEFORE UPDATE ON universal_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Applies RLS dynamically to all tables with a tenant_id column
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['contacts','companies','deals','activities', 'notes', 'service_packages', 'import_jobs','custom_field_definitions','tenant_modules', 'tenant_automations', 'universal_records'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t AND column_name = 'tenant_id'
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_isolation', t);
      EXECUTE format(
        $q$CREATE POLICY %I ON %I AS PERMISSIVE FOR ALL USING (COALESCE(current_setting('app.current_tenant_id', true), '') = '' OR tenant_id::text = current_setting('app.current_tenant_id', true))$q$,
        t || '_tenant_isolation', t
      );
    END IF;
  END LOOP;
END
$$;


-- ==========================================
-- From: 002_seed_data.sql
-- ==========================================
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


-- ==========================================
-- From: 008_fix_deal_stages.sql
-- ==========================================
-- =============================================================
-- izhubs ERP — Migration 008: Fix Deal Stages
-- Reason: Expand allowed stages to support all industrial seeds (Restaurant, Freelancer, etc.)
-- =============================================================

-- 1. Drop the old restrictive constraint
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_stage_check;

-- 2. Add a much more inclusive constraint
-- This includes standard CRM stages plus industry-specific ones (F&B, Freelancer, Co-working)
ALTER TABLE deals ADD CONSTRAINT deals_stage_check CHECK (
  stage IN (
    -- Standard CRM
    'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'lead', 
    -- Operations / Project
    'onboarding', 'active', 'revision', 'completed', 'cancelled', 'pending', 'renewal',
    -- Restaurant / F&B
    'inquiry', 'reservation', 'confirmed', 'seated',
    -- Coworking stages
    'tour_scheduled', 'tour_completed', 'member_active',
    -- Coworking legacy / pipeline stages
    'consulting', 'site_visit', 'closing', 'referred', 'quoted'
  )
);


-- ==========================================
-- From: 010_seed_industry_templates.sql
-- ==========================================
-- =============================================================
-- izhubs ERP — Seed Industry Templates
-- Inserts all 6 built-in templates from templates/industry/*.ts
-- into the industry_templates DB table so the app can read them.
-- Also sets the demo tenant's industry to 'virtual-office'.
-- =============================================================

INSERT INTO industry_templates (id, name, description, icon, category, nav_config, theme_defaults, required_modules)
VALUES

-- ────────────────────────────────────────────────────────────────
-- 1. VIRTUAL OFFICE
-- ────────────────────────────────────────────────────────────────
('virtual-office', 'Virtual Office Services',
 'Quản lý khách hàng, hợp đồng và gói dịch vụ cho trung tâm văn phòng ảo.',
 '🏢', 'real_estate',
 '{
   "sidebar": [
     {"id":"dashboard",        "label":"Dashboard",        "href":"/dashboard",        "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"leads",            "label":"Leads",            "href":"/leads",            "icon":"UserPlus",        "roles":["admin","member"]},
     {"id":"contacts",         "label":"Contacts",         "href":"/contacts",         "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",            "label":"Pipeline",         "href":"/deals",            "icon":"Briefcase",       "roles":["admin","member"]},
     {"id":"tasks",            "label":"Tasks",            "href":"/tasks",            "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"service-packages", "label":"Service Packages", "href":"/service-packages", "icon":"Package",         "roles":["admin","member"]},
     {"id":"reports",          "label":"Reports",          "href":"/reports",          "icon":"BarChart2",       "roles":["admin","viewer"]},
     {"id":"import",           "label":"Import",           "href":"/import",           "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":3,  "widgetId":"kpi-mrr"},
       {"colSpan":3,  "widgetId":"kpi-active-clients"},
       {"colSpan":3,  "widgetId":"kpi-renewals-due"},
       {"colSpan":3,  "widgetId":"kpi-churn-rate"},
       {"colSpan":8,  "widgetId":"arr-line-chart"},
       {"colSpan":4,  "widgetId":"revenue-by-package-donut"},
       {"colSpan":7,  "widgetId":"top-customers-table"},
       {"colSpan":5,  "widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",        "label":"New Lead",        "color":"#94a3b8"},
     {"key":"proposal",    "label":"Proposal Sent",   "color":"#60a5fa"},
     {"key":"negotiation", "label":"Negotiation",     "color":"#f59e0b"},
     {"key":"onboarding",  "label":"Onboarding",      "color":"#a78bfa"},
     {"key":"active",      "label":"Active Client",   "color":"#34d399"},
     {"key":"renewal",     "label":"Up for Renewal",  "color":"#f97316"},
     {"key":"won",         "label":"Won",             "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Lost",            "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#6366f1","--color-primary-hover":"#4f46e5","--color-primary-light":"#e0e7ff","--color-primary-muted":"#312e81"}',
 '["crm","contracts","service-packages","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 2. AGENCY
-- ────────────────────────────────────────────────────────────────
('agency', 'Agency / Digital Marketing',
 'Quản lý khách hàng, dự án và hợp đồng cho digital agency, marketing agency.',
 '🎯', 'services',
 '{
   "sidebar": [
     {"id":"dashboard", "label":"Dashboard", "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"leads",     "label":"Leads",     "href":"/leads",     "icon":"UserPlus",        "roles":["admin","member"]},
     {"id":"contacts",  "label":"Contacts",  "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",     "label":"Deals",     "href":"/deals",     "icon":"Briefcase",       "roles":["admin","member"]},
     {"id":"tasks",     "label":"Tasks",     "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"reports",   "label":"Reports",   "href":"/reports",   "icon":"BarChart2",       "roles":["admin","viewer"]},
     {"id":"import",    "label":"Import",    "href":"/import",    "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":8,  "widgetId":"pipeline-summary"},
       {"colSpan":4,  "widgetId":"tasks-due-today"},
       {"colSpan":6,  "widgetId":"revenue-this-month"},
       {"colSpan":6,  "widgetId":"deals-by-stage"},
       {"colSpan":12, "widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",        "label":"Lead mới",      "color":"#94a3b8"},
     {"key":"proposal",    "label":"Gửi proposal",  "color":"#60a5fa"},
     {"key":"negotiation", "label":"Đàm phán",      "color":"#f59e0b"},
     {"key":"onboarding",  "label":"Onboarding",    "color":"#a78bfa"},
     {"key":"active",      "label":"Đang chạy",     "color":"#34d399"},
     {"key":"renewal",     "label":"Gia hạn",       "color":"#f97316"},
     {"key":"won",         "label":"Chốt",          "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Không chốt",    "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#6366f1","--color-primary-hover":"#4f46e5","--color-primary-light":"#e0e7ff","--color-primary-muted":"#312e81"}',
 '["crm","contracts","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 3. FREELANCER
-- ────────────────────────────────────────────────────────────────
('freelancer', 'Freelancer / Consultant',
 'Quản lý khách hàng và dự án cho freelancer, consultant độc lập.',
 '💼', 'services',
 '{
   "sidebar": [
     {"id":"dashboard", "label":"Dashboard", "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"contacts",  "label":"Clients",   "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",     "label":"Projects",  "href":"/deals",     "icon":"Briefcase",       "roles":["admin","member"]},
     {"id":"tasks",     "label":"Tasks",     "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"import",    "label":"Import",    "href":"/import",    "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":6, "widgetId":"revenue-this-month"},
       {"colSpan":6, "widgetId":"pipeline-summary"},
       {"colSpan":12,"widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",        "label":"Inquiry",     "color":"#94a3b8"},
     {"key":"proposal",    "label":"Proposal",    "color":"#60a5fa"},
     {"key":"negotiation", "label":"Negotiation", "color":"#f59e0b"},
     {"key":"active",      "label":"In Progress", "color":"#34d399"},
     {"key":"renewal",     "label":"Revision",    "color":"#f97316"},
     {"key":"won",         "label":"Completed",   "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Dropped",     "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#8b5cf6","--color-primary-hover":"#7c3aed","--color-primary-light":"#ede9fe","--color-primary-muted":"#4c1d95"}',
 '["crm","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 4. RESTAURANT / F&B
-- ────────────────────────────────────────────────────────────────
('restaurant', 'Nhà hàng / F&B',
 'Quản lý đặt bàn, khách hàng thân thiết và phản hồi cho nhà hàng, quán cafe.',
 '🍽️', 'hospitality',
 '{
   "sidebar": [
     {"id":"dashboard", "label":"Tổng quan",  "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"contacts",  "label":"Khách hàng", "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",     "label":"Đặt bàn",    "href":"/deals",     "icon":"UtensilsCrossed", "roles":["admin","member"]},
     {"id":"tasks",     "label":"Công việc",  "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"import",    "label":"Import",     "href":"/import",    "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Cài đặt", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":12, "widgetId":"reservations-today"},
       {"colSpan":6,  "widgetId":"revenue-today"},
       {"colSpan":6,  "widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"new",         "label":"Hỏi thông tin", "color":"#94a3b8"},
     {"key":"contacted",   "label":"Đã đặt bàn",    "color":"#60a5fa"},
     {"key":"qualified",   "label":"Xác nhận",      "color":"#a78bfa"},
     {"key":"negotiation", "label":"Đang ngồi",     "color":"#f59e0b"},
     {"key":"won",         "label":"Hoàn thành",    "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Huỷ",           "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#f59e0b","--color-primary-hover":"#d97706","--color-primary-light":"#fef3c7","--color-primary-muted":"#78350f"}',
 '["crm","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 5. CAFÉ / COFFEE SHOP
-- ────────────────────────────────────────────────────────────────
('cafe', 'Café / Coffee Shop',
 'Quản lý loyalty, khách hàng thân thiết và sự kiện cho quán cà phê.',
 '☕', 'hospitality',
 '{
   "sidebar": [
     {"id":"dashboard", "label":"Dashboard", "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"contacts",  "label":"Members",   "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",     "label":"Orders",    "href":"/deals",     "icon":"ShoppingCart",    "roles":["admin","member"]},
     {"id":"tasks",     "label":"Tasks",     "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"import",    "label":"Import",    "href":"/import",    "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":6, "widgetId":"revenue-today"},
       {"colSpan":6, "widgetId":"top-customers-table"},
       {"colSpan":12,"widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",        "label":"Walk-in",    "color":"#94a3b8"},
     {"key":"contacted",   "label":"Ordering",   "color":"#60a5fa"},
     {"key":"active",      "label":"Served",     "color":"#34d399"},
     {"key":"won",         "label":"Completed",  "color":"#22c55e", "closed":true},
     {"key":"lost",        "label":"Cancelled",  "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#f97316","--color-primary-hover":"#ea580c","--color-primary-light":"#ffedd5","--color-primary-muted":"#7c2d12"}',
 '["crm","reports"]'
),

-- ────────────────────────────────────────────────────────────────
-- 6. COWORKING
-- ────────────────────────────────────────────────────────────────
('coworking', 'Coworking / Shared Office',
 'Quản lý thành viên, hợp đồng và không gian cho coworking space.',
 '🤝', 'real_estate',
 '{
   "sidebar": [
     {"id":"dashboard",        "label":"Dashboard",      "href":"/dashboard",        "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
     {"id":"leads",            "label":"Leads",          "href":"/leads",            "icon":"UserPlus",        "roles":["admin","member"]},
     {"id":"contacts",         "label":"Members",        "href":"/contacts",         "icon":"Users",           "roles":["admin","member"]},
     {"id":"deals",            "label":"Memberships",    "href":"/deals",            "icon":"Briefcase",       "roles":["admin","member"]},
     {"id":"tasks",            "label":"Tasks",          "href":"/tasks",            "icon":"CheckSquare",     "roles":["admin","member"]},
     {"id":"service-packages", "label":"Plans",          "href":"/service-packages", "icon":"Package",         "roles":["admin","member"]},
     {"id":"reports",          "label":"Reports",        "href":"/reports",          "icon":"BarChart2",       "roles":["admin","viewer"]},
     {"id":"import",           "label":"Import",         "href":"/import",           "icon":"Upload",          "roles":["admin"]}
   ],
   "bottomItems": [
     {"id":"settings", "label":"Settings", "href":"/settings", "icon":"Settings", "roles":["admin"]}
   ],
   "dashboardLayout": {
     "rows": [
       {"colSpan":3,  "widgetId":"kpi-mrr"},
       {"colSpan":3,  "widgetId":"kpi-active-clients"},
       {"colSpan":3,  "widgetId":"kpi-renewals-due"},
       {"colSpan":3,  "widgetId":"kpi-churn-rate"},
       {"colSpan":8,  "widgetId":"arr-line-chart"},
       {"colSpan":4,  "widgetId":"revenue-by-package-donut"},
       {"colSpan":12, "widgetId":"recent-activity-feed"}
     ]
   },
   "pipelineStages": [
     {"key":"lead",         "label":"Inquiry",      "color":"#94a3b8"},
     {"key":"proposal",     "label":"Tour Booked",  "color":"#60a5fa"},
     {"key":"negotiation",  "label":"Negotiation",  "color":"#f59e0b"},
     {"key":"onboarding",   "label":"Onboarding",   "color":"#a78bfa"},
     {"key":"active",       "label":"Active Member","color":"#34d399"},
     {"key":"renewal",      "label":"Renewal",      "color":"#f97316"},
     {"key":"won",          "label":"Retained",     "color":"#22c55e", "closed":true},
     {"key":"lost",         "label":"Churned",      "color":"#ef4444", "closed":true}
   ]
 }',
 '{"--color-primary":"#10b981","--color-primary-hover":"#059669","--color-primary-light":"#d1fae5","--color-primary-muted":"#064e3b"}',
 '["crm","contracts","service-packages","reports"]'
)

ON CONFLICT (id) DO UPDATE SET
  name           = EXCLUDED.name,
  description    = EXCLUDED.description,
  icon           = EXCLUDED.icon,
  category       = EXCLUDED.category,
  nav_config     = EXCLUDED.nav_config,
  theme_defaults = EXCLUDED.theme_defaults,
  required_modules = EXCLUDED.required_modules,
  updated_at     = NOW();

-- Set the demo tenant's industry to 'virtual-office'
UPDATE tenants
SET industry = 'virtual-office', updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';


-- ==========================================
-- From: 011_add_is_active_to_industry_templates.sql
-- ==========================================
-- =============================================================
-- Migration 011: Add is_active flag to industry_templates
-- =============================================================

ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- By default, set all to false EXCEPT the ones we have actually built
-- Let's set virtual-office and coworking to true as they are the most complete
UPDATE industry_templates SET is_active = false;
UPDATE industry_templates SET is_active = true WHERE id IN ('virtual-office', 'coworking');


-- ==========================================
-- From: 012_system_logs_and_knowledge_base.sql
-- ==========================================
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


-- ==========================================
-- From: 013_audit_triggers.sql
-- ==========================================
-- ============================================================
-- Migration 013: Centralized Audit Triggers
-- 
-- Approach: One shared PL/pgSQL trigger function that captures
-- INSERT / UPDATE / DELETE on all core business tables.
-- The user_id is read from the session variable 
-- 'audit.current_user_id' set by the application layer.
--
-- Tables covered:
--   deals, contacts, companies, notes, activities,
--   service_packages, custom_field_definitions
-- ============================================================

-- Step 1: Create the shared audit trigger function
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id    UUID;
  v_action     TEXT;
  v_before     JSONB;
  v_after      JSONB;
BEGIN
  -- Read the user ID set by the app before each query
  BEGIN
    v_user_id := NULLIF(current_setting('audit.current_user_id', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL; -- Graceful fallback for migrations / scripts
  END;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_before := NULL;
    v_after  := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_before := to_jsonb(OLD);
    v_after  := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_before := to_jsonb(OLD);
    v_after  := NULL;
  END IF;

  -- Skip soft-deletes that masquerade as updates (they are already logged by DELETE-like UPDATE)
  -- Only skip pure internal "updated_at" touches with no real field change
  IF TG_OP = 'UPDATE' AND v_before - 'updated_at' = v_after - 'updated_at' THEN
    RETURN NEW; -- No meaningful change, skip
  END IF;

  INSERT INTO audit_log (entity_type, entity_id, action, user_id, before, after)
  VALUES (
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN (v_before->>'id')::UUID
      ELSE (v_after->>'id')::UUID
    END,
    v_action,
    v_user_id,
    v_before,
    v_after
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Step 2: Attach the trigger to all core business tables
-- Using a DO block to avoid repetition

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'deals',
    'contacts',
    'companies',
    'notes',
    'activities',
    'service_packages',
    'custom_field_definitions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Drop existing trigger to allow re-running this migration safely
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit ON %I', t);
    
    -- Create the trigger (AFTER to capture final state)
    EXECUTE format(
      'CREATE TRIGGER trg_audit
       AFTER INSERT OR UPDATE OR DELETE ON %I
       FOR EACH ROW EXECUTE FUNCTION fn_audit_log()',
      t
    );
  END LOOP;
END;
$$;

-- Step 3: Set the session variable from API layer
-- The application MUST call this before any mutation:
--   SET LOCAL audit.current_user_id = '<user-uuid>';
-- This is done via db.queryAsTenant() or a new db.queryAsUser() helper.

COMMENT ON FUNCTION fn_audit_log() IS
  'Centralized audit log trigger. Captures all INSERT/UPDATE/DELETE on business tables.
   Reads user identity from session variable audit.current_user_id.
   Applied to: deals, contacts, companies, notes, activities, service_packages, custom_field_definitions.';


-- ==========================================
-- From: 014_audit_log_tenant.sql
-- ==========================================
-- Migration 014: Add tenant_id to audit_log and update trigger
-- Needed because trigger writes user_id=NULL (no session context)
-- causing LEFT JOIN tenant filter to fail → empty UI

-- 1. Add tenant_id column
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- 2. Add index for efficient tenant queries
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON audit_log(tenant_id);

-- 3. Update the trigger function to also capture tenant_id from session
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id    UUID;
  v_tenant_id  UUID;
  v_action     TEXT;
  v_before     JSONB;
  v_after      JSONB;
BEGIN
  -- Read user + tenant from app session variables (set by engine layer)
  BEGIN
    v_user_id := NULLIF(current_setting('audit.current_user_id', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  BEGIN
    v_tenant_id := NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_tenant_id := NULL;
  END;

  -- Fallback: try to get tenant_id from the row itself if not set in session
  IF v_tenant_id IS NULL THEN
    BEGIN
      IF TG_OP = 'DELETE' THEN
        v_tenant_id := (to_jsonb(OLD)->>'tenant_id')::UUID;
      ELSE
        v_tenant_id := (to_jsonb(NEW)->>'tenant_id')::UUID;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_tenant_id := NULL;
    END;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_before := NULL;
    v_after  := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_before := to_jsonb(OLD);
    v_after  := to_jsonb(NEW);
    -- Skip if only updated_at changed
    IF v_before - 'updated_at' = v_after - 'updated_at' THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_before := to_jsonb(OLD);
    v_after  := NULL;
  END IF;

  INSERT INTO audit_log (entity_type, entity_id, tenant_id, action, user_id, before, after)
  VALUES (
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN (v_before->>'id')::UUID
      ELSE (v_after->>'id')::UUID
    END,
    v_tenant_id,
    v_action,
    v_user_id,
    v_before,
    v_after
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


-- ==========================================
-- From: 015_ephemeral_demo_users.sql
-- ==========================================
-- Migration 015: Ephemeral demo users
-- Each demo session creates a new user with is_demo=true.
-- Cleanup: after 24h or when user clicks Reset, delete the tenant → 
-- CASCADE deletes all related data (users, deals, contacts, notes, audit_log).

-- 1. Add demo fields to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS is_demo    BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 2. Add demo field to tenants table for easy cascade cleanup
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS is_demo    BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 3. Add index for efficient cleanup queries  
CREATE INDEX IF NOT EXISTS idx_users_demo_expiry   ON users(is_demo, expires_at)   WHERE is_demo = true;
CREATE INDEX IF NOT EXISTS idx_tenants_demo_expiry ON tenants(is_demo, expires_at) WHERE is_demo = true;

-- 4. Audit log: change user_id FK to CASCADE DELETE so demo user deletion
--    automatically removes their logs. Real users with NULL user_id are unaffected.
ALTER TABLE audit_log 
  DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey,
  ADD CONSTRAINT audit_log_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMENT ON COLUMN users.is_demo    IS 'True for ephemeral demo users created at demo-login. Cleaned up after expires_at.';
COMMENT ON COLUMN users.expires_at IS 'Expiry time for demo users. NULL = permanent user.';
COMMENT ON COLUMN tenants.is_demo  IS 'True for ephemeral demo tenants. Cascade-deletes all data when dropped.';


-- ==========================================
-- From: 016_izform_plugin.sql
-- ==========================================
-- =============================================================
-- Migration 016: izForm Plugin
-- Tables: iz_forms, iz_form_submissions
-- =============================================================

CREATE TABLE IF NOT EXISTS iz_forms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  fields      JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS iz_forms_tenant_idx ON iz_forms(tenant_id)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS iz_form_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id      UUID NOT NULL REFERENCES iz_forms(id),
  tenant_id    UUID NOT NULL,
  data         JSONB NOT NULL,
  contact_id   UUID REFERENCES contacts(id),
  ip_address   VARCHAR(50),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS iz_form_submissions_form_idx ON iz_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS iz_form_submissions_tenant_idx ON iz_form_submissions(tenant_id);

-- Seed izform plugin into modules catalog
INSERT INTO modules (id, name, description, version, category, icon, is_official, config_schema)
VALUES (
  'izform',
  'izForm — Lead Capture Forms',
  'Create custom lead capture forms and embed them into your marketing sites via iframe.',
  '1.0.0',
  'operations',
  '📋',
  true,
  '{}'
) ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- From: 016_translate_templates_to_english.sql
-- ==========================================
-- =============================================================
-- izhubs ERP — Migration 016: Translate industry template
-- descriptions and sidebar labels to English.
-- Also fix Restaurant template to use English nav labels.
-- =============================================================

UPDATE industry_templates SET
  description = 'Manage clients, contracts, and service packages for virtual office centers.',
  updated_at  = NOW()
WHERE id = 'virtual-office';

UPDATE industry_templates SET
  description = 'Manage clients, projects, and contracts for digital agencies and marketing teams.',
  nav_config  = jsonb_set(nav_config, '{pipelineStages}', '[
    {"key":"lead",        "label":"New Lead",      "color":"#94a3b8"},
    {"key":"proposal",    "label":"Proposal Sent", "color":"#60a5fa"},
    {"key":"negotiation", "label":"Negotiation",   "color":"#f59e0b"},
    {"key":"onboarding",  "label":"Onboarding",    "color":"#a78bfa"},
    {"key":"active",      "label":"Active",        "color":"#34d399"},
    {"key":"renewal",     "label":"Renewal",       "color":"#f97316"},
    {"key":"won",         "label":"Won",           "color":"#22c55e", "closed":true},
    {"key":"lost",        "label":"Lost",          "color":"#ef4444", "closed":true}
  ]'::jsonb),
  updated_at  = NOW()
WHERE id = 'agency';

UPDATE industry_templates SET
  description = 'Manage clients and projects for independent freelancers and consultants.',
  updated_at  = NOW()
WHERE id = 'freelancer';

UPDATE industry_templates SET
  name        = 'Restaurant / F&B',
  description = 'Manage reservations, loyal customers, and feedback for restaurants and cafes.',
  nav_config  = jsonb_set(
    jsonb_set(
      jsonb_set(
        nav_config,
        '{sidebar}', '[
          {"id":"dashboard", "label":"Dashboard",    "href":"/dashboard", "icon":"LayoutDashboard", "roles":["admin","member","viewer"]},
          {"id":"contacts",  "label":"Customers",    "href":"/contacts",  "icon":"Users",           "roles":["admin","member"]},
          {"id":"deals",     "label":"Reservations", "href":"/deals",     "icon":"UtensilsCrossed", "roles":["admin","member"]},
          {"id":"tasks",     "label":"Tasks",        "href":"/tasks",     "icon":"CheckSquare",     "roles":["admin","member"]},
          {"id":"import",    "label":"Import",       "href":"/import",    "icon":"Upload",          "roles":["admin"]}
        ]'::jsonb
      ),
      '{bottomItems}', '[{"id":"settings","label":"Settings","href":"/settings","icon":"Settings","roles":["admin"]}]'::jsonb
    ),
    '{pipelineStages}', '[
      {"key":"new",         "label":"Inquiry",     "color":"#94a3b8"},
      {"key":"contacted",   "label":"Reserved",    "color":"#60a5fa"},
      {"key":"qualified",   "label":"Confirmed",   "color":"#a78bfa"},
      {"key":"negotiation", "label":"Seated",      "color":"#f59e0b"},
      {"key":"won",         "label":"Completed",   "color":"#22c55e", "closed":true},
      {"key":"lost",        "label":"Cancelled",   "color":"#ef4444", "closed":true}
    ]'::jsonb
  ),
  updated_at  = NOW()
WHERE id = 'restaurant';

UPDATE industry_templates SET
  description = 'Manage loyalty programs, regular customers, and events for coffee shops.',
  updated_at  = NOW()
WHERE id = 'cafe';

UPDATE industry_templates SET
  description = 'Manage members, memberships, and shared spaces for coworking spaces.',
  updated_at  = NOW()
WHERE id = 'coworking';


-- ==========================================
-- From: 017_dashboard_configs.sql
-- ==========================================
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


-- ==========================================
-- From: 018_fix_dashboard_unique_constraint.sql
-- ==========================================
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


-- ==========================================
-- From: 019_izlanding_plugin.sql
-- ==========================================
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


-- ==========================================
-- From: 020_izform_phase2.sql
-- ==========================================
-- =============================================================
-- Migration 020: izForm Phase 2 — Webhooks & Lead Routing
-- Adds webhook_url and auto_convert_lead columns to iz_forms
-- =============================================================

ALTER TABLE iz_forms ADD COLUMN IF NOT EXISTS webhook_url TEXT DEFAULT NULL;
ALTER TABLE iz_forms ADD COLUMN IF NOT EXISTS auto_convert_lead BOOLEAN NOT NULL DEFAULT false;


-- ==========================================
-- From: 021_biz_ops.sql
-- ==========================================
-- =============================================================
-- izhubs ERP — Business Operations Plugin (biz-ops) v1.0
-- Tables: contracts, contract_milestones, campaigns
-- =============================================================

-- ============================================================
-- CONTRACTS (signed agreements with clients)
-- ============================================================
CREATE TABLE IF NOT EXISTS contracts (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id      UUID          REFERENCES companies(id) ON DELETE SET NULL,
  contact_id      UUID          REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id         UUID          REFERENCES deals(id) ON DELETE SET NULL,

  title           TEXT          NOT NULL,
  code            VARCHAR(50),
  total_value     NUMERIC(15,2) NOT NULL DEFAULT 0,
  collected_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency        VARCHAR(10)   NOT NULL DEFAULT 'VND',

  status          VARCHAR(20)   NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','signed','in_progress','completed','cancelled')),

  start_date      DATE,
  end_date        DATE,
  payment_terms   TEXT,
  notes           TEXT,

  owner_id        UUID          REFERENCES users(id) ON DELETE SET NULL,
  custom_fields   JSONB         NOT NULL DEFAULT '{}',
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONTRACT MILESTONES (payment checkpoints)
-- ============================================================
CREATE TABLE IF NOT EXISTS contract_milestones (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contract_id     UUID          NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

  title           TEXT          NOT NULL,
  amount          NUMERIC(15,2) NOT NULL DEFAULT 0,
  percentage      NUMERIC(5,2),
  due_date        DATE,

  status          VARCHAR(20)   NOT NULL DEFAULT 'expected'
                    CHECK (status IN ('expected','invoiced','received','overdue')),

  received_date   DATE,
  invoice_number  VARCHAR(100),
  notes           TEXT,

  sort_order      INTEGER       NOT NULL DEFAULT 0,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CAMPAIGNS (projects / work units under a contract)
-- ============================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contract_id      UUID          NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

  name             TEXT          NOT NULL,
  type             VARCHAR(50)   NOT NULL DEFAULT 'general'
                     CHECK (type IN ('seo','ads','social','web','construction','general')),

  allocated_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
  actual_cogs      NUMERIC(15,2) NOT NULL DEFAULT 0,

  stage            VARCHAR(50)   NOT NULL DEFAULT 'planning',
  health           VARCHAR(20)   NOT NULL DEFAULT 'healthy'
                     CHECK (health IN ('healthy','at_risk','delayed','completed')),

  start_date       DATE,
  end_date         DATE,
  owner_id         UUID          REFERENCES users(id) ON DELETE SET NULL,

  custom_fields    JSONB         NOT NULL DEFAULT '{}',
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contracts_tenant       ON contracts(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_company      ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status       ON contracts(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_deal         ON contracts(deal_id);

CREATE INDEX IF NOT EXISTS idx_milestones_contract    ON contract_milestones(contract_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_milestones_tenant      ON contract_milestones(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_milestones_status      ON contract_milestones(status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_contract     ON campaigns(contract_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant       ON campaigns(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_type         ON campaigns(type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_owner        ON campaigns(owner_id);

-- ── Updated_at triggers ─────────────────────────────────────
DROP TRIGGER IF EXISTS contracts_updated_at ON contracts;
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS milestones_updated_at ON contract_milestones;
CREATE TRIGGER milestones_updated_at BEFORE UPDATE ON contract_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS campaigns_updated_at ON campaigns;
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ─────────────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['contracts','contract_milestones','campaigns'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_isolation', t);
    EXECUTE format(
      $q$CREATE POLICY %I ON %I AS PERMISSIVE FOR ALL USING (
        COALESCE(current_setting('app.current_tenant_id', true), '') = ''
        OR tenant_id::text = current_setting('app.current_tenant_id', true)
      )$q$,
      t || '_tenant_isolation', t
    );
  END LOOP;
END
$$;

-- ── Seed biz-ops module ─────────────────────────────────────
INSERT INTO modules (id, name, description, category, icon, is_official)
VALUES (
  'biz-ops',
  'Business Operations',
  'Manage contracts, payment milestones, and project campaigns. Track Money In and operational scope.',
  'operations',
  '💼',
  true
) ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- From: 022_biz_ops_core_projects.sql
-- ==========================================
-- =============================================================
-- Migration 022: Biz-Ops Core Project Management (Pillar 1)
-- Introduces Portfolios, Campaign Phases, and makes Campaigns 
-- standalone (nullable contract_id) with is_private flag.
-- =============================================================

-- 1. PORTFOLIOS TABLE
CREATE TABLE IF NOT EXISTS portfolios (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT          NOT NULL,
  description     TEXT,
  owner_id        UUID          REFERENCES users(id) ON DELETE SET NULL,
  status          VARCHAR(20)   NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_tenant ON portfolios(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_portfolios_owner ON portfolios(owner_id);

DROP TRIGGER IF EXISTS portfolios_updated_at ON portfolios;
CREATE TRIGGER portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. ALTER CAMPAIGNS (PROJECTS)
ALTER TABLE campaigns ALTER COLUMN contract_id DROP NOT NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_campaigns_portfolio ON campaigns(portfolio_id) WHERE deleted_at IS NULL;

-- 3. CAMPAIGN PHASES TABLE
CREATE TABLE IF NOT EXISTS campaign_phases (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id     UUID          NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name            TEXT          NOT NULL,
  start_date      DATE,
  end_date        DATE,
  status          VARCHAR(20)   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  sort_order      INTEGER       NOT NULL DEFAULT 0,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_phases_tenant ON campaign_phases(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_phases_campaign ON campaign_phases(campaign_id) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS campaign_phases_updated_at ON campaign_phases;
CREATE TRIGGER campaign_phases_updated_at BEFORE UPDATE ON campaign_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. RLS POLICIES FOR NEW TABLES
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['portfolios','campaign_phases'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_isolation', t);
    EXECUTE format(
      $q$CREATE POLICY %I ON %I AS PERMISSIVE FOR ALL USING (
        COALESCE(current_setting('app.current_tenant_id', true), '') = ''
        OR tenant_id::text = current_setting('app.current_tenant_id', true)
      )$q$,
      t || '_tenant_isolation', t
    );
  END LOOP;
END
$$;


-- ==========================================
-- From: 022_biz_ops_finance.sql
-- ==========================================
-- ==============================================================================
-- Migration: Biz-Ops Financial Tracking (Expenses & Payments)
-- ==============================================================================

-- 1. Create expense_records table
CREATE TABLE IF NOT EXISTS expense_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid
    receipt_url TEXT,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expense_records_campaign_id ON expense_records(campaign_id);
CREATE INDEX IF NOT EXISTS idx_expense_records_tenant_id ON expense_records(tenant_id);

-- 2. Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid
    reference VARCHAR(100), -- Transaction ID, check number
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_records_contract_id ON payment_records(contract_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_tenant_id ON payment_records(tenant_id);

-- 3. Trigger Function: Roll-up actual_cogs on campaigns
CREATE OR REPLACE FUNCTION update_campaign_actual_cogs()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the campaign's actual_cogs
    -- We sum all non-deleted expenses with status = 'paid' for the given campaign
    UPDATE campaigns
    SET actual_cogs = (
        SELECT COALESCE(SUM(amount), 0)
        FROM expense_records
        WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
          AND status = 'paid'
          AND deleted_at IS NULL
    )
    WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
    
    RETURN NULL; -- For AFTER trigger
END;
$$ LANGUAGE plpgsql;

-- Triggers for expense_records
DROP TRIGGER IF EXISTS trigger_expense_cogs_insert ON expense_records;
CREATE TRIGGER trigger_expense_cogs_insert
AFTER INSERT ON expense_records
FOR EACH ROW EXECUTE FUNCTION update_campaign_actual_cogs();

DROP TRIGGER IF EXISTS trigger_expense_cogs_update ON expense_records;
CREATE TRIGGER trigger_expense_cogs_update
AFTER UPDATE OF amount, status, deleted_at ON expense_records
FOR EACH ROW EXECUTE FUNCTION update_campaign_actual_cogs();

DROP TRIGGER IF EXISTS trigger_expense_cogs_delete ON expense_records;
CREATE TRIGGER trigger_expense_cogs_delete
AFTER DELETE ON expense_records
FOR EACH ROW EXECUTE FUNCTION update_campaign_actual_cogs();


-- 4. Trigger Function: Roll-up collected_value on contracts
CREATE OR REPLACE FUNCTION update_contract_collected_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the contract's collected_value
    -- We sum all non-deleted payments with status = 'paid' for the given contract
    UPDATE contracts
    SET collected_value = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payment_records
        WHERE contract_id = COALESCE(NEW.contract_id, OLD.contract_id)
          AND status = 'paid'
          AND deleted_at IS NULL
    )
    WHERE id = COALESCE(NEW.contract_id, OLD.contract_id);
    
    RETURN NULL; -- For AFTER trigger
END;
$$ LANGUAGE plpgsql;

-- Triggers for payment_records
DROP TRIGGER IF EXISTS trigger_payment_collected_insert ON payment_records;
CREATE TRIGGER trigger_payment_collected_insert
AFTER INSERT ON payment_records
FOR EACH ROW EXECUTE FUNCTION update_contract_collected_value();

DROP TRIGGER IF EXISTS trigger_payment_collected_update ON payment_records;
CREATE TRIGGER trigger_payment_collected_update
AFTER UPDATE OF amount, status, deleted_at ON payment_records
FOR EACH ROW EXECUTE FUNCTION update_contract_collected_value();

DROP TRIGGER IF EXISTS trigger_payment_collected_delete ON payment_records;
CREATE TRIGGER trigger_payment_collected_delete
AFTER DELETE ON payment_records
FOR EACH ROW EXECUTE FUNCTION update_contract_collected_value();


-- ==========================================
-- From: 023_project_members.sql
-- ==========================================
-- =========================================================================
-- izhubs ERP — Biz-Ops Plugin — Migration 023
-- Team Members Mapping
-- =========================================================================

CREATE TABLE IF NOT EXISTS project_members (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, manager, member, guest
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_campaign_id ON project_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);


-- ==========================================
-- From: 024_campaign_tasks_files.sql
-- ==========================================
-- =========================================================================
-- izhubs ERP — Biz-Ops Plugin — Migration 024
-- Nested Workspace Entities: Tasks & Files
-- =========================================================================

CREATE TABLE IF NOT EXISTS campaign_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo', -- todo, in_progress, review, done
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_tasks_campaign_id ON campaign_tasks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_tasks_assignee_id ON campaign_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_campaign_tasks_tenant_id ON campaign_tasks(tenant_id);

CREATE TABLE IF NOT EXISTS campaign_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_files_campaign_id ON campaign_files(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_files_tenant_id ON campaign_files(tenant_id);


-- ==========================================
-- From: 024_iz_task.sql
-- ==========================================
-- =============================================================
-- izhubs ERP — Universal Task Engine (iz-task)
-- Tables: tasks, task_subtasks
-- =============================================================

-- ============================================================
-- TASKS (Polymorphic core)
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Polymorphic Entity Reference
  entity_type     VARCHAR(50)   NOT NULL, -- e.g., 'biz-ops.campaign', 'crm.deal'
  entity_id       UUID          NOT NULL,

  title           TEXT          NOT NULL,
  description     TEXT,
  
  status          VARCHAR(20)   NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo','in_progress','review','done','cancelled')),
                    
  priority        VARCHAR(20)   NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low','medium','high','urgent')),
                    
  due_date        TIMESTAMPTZ,
  
  assignee_id     UUID          REFERENCES users(id) ON DELETE SET NULL,
  creator_id      UUID          REFERENCES users(id) ON DELETE SET NULL,
  
  parent_task_id  UUID, -- Self-referencing FK for subtasks (Optional alternative to task_subtasks)
  
  sort_order      FLOAT         NOT NULL DEFAULT 0, -- For Kanban/List reordering
  
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Self-reference FK explicitly added purely for optional native hierarchy (Phase 3)
ALTER TABLE tasks ADD CONSTRAINT fk_task_parent FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_polymorphic ON tasks(tenant_id, entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assignee    ON tasks(assignee_id) WHERE deleted_at IS NULL;

-- ── Updated_at triggers ─────────────────────────────────────
DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tasks_tenant_isolation ON tasks;
CREATE POLICY tasks_tenant_isolation ON tasks AS PERMISSIVE FOR ALL USING (
  COALESCE(current_setting('app.current_tenant_id', true), '') = ''
  OR tenant_id::text = current_setting('app.current_tenant_id', true)
);

-- ============================================================
-- TASK SUBTASKS (Simple checklist approach, preferred for UI)
-- ============================================================
CREATE TABLE IF NOT EXISTS task_subtasks (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID          NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tenant_id       UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title           TEXT          NOT NULL,
  is_completed    BOOLEAN       NOT NULL DEFAULT false,
  sort_order      INTEGER       NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subtasks_task ON task_subtasks(task_id);

DROP TRIGGER IF EXISTS task_subtasks_updated_at ON task_subtasks;
CREATE TRIGGER task_subtasks_updated_at BEFORE UPDATE ON task_subtasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_subtasks FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS task_subtasks_tenant_isolation ON task_subtasks;
CREATE POLICY task_subtasks_tenant_isolation ON task_subtasks AS PERMISSIVE FOR ALL USING (
  COALESCE(current_setting('app.current_tenant_id', true), '') = ''
  OR tenant_id::text = current_setting('app.current_tenant_id', true)
);

-- ── Seed izTask module flag ──────────────────────────────────
INSERT INTO modules (id, name, description, category, icon, is_official)
VALUES (
  'iz-task',
  'Universal Task Engine',
  'Polymorphic task and subtask engine for generic entity attachments.',
  'core',
  '✅',
  true
) ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- From: 025_izlanding_analytics.sql
-- ==========================================
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


-- ==========================================
-- From: 026_izlanding_blocks.sql
-- ==========================================
-- Migration for izLanding Blocks Library
-- Allows saving custom blocks and system templates

CREATE TABLE IF NOT EXISTS iz_landing_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'custom',
  type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup of public system templates or tenant's custom blocks
CREATE INDEX IF NOT EXISTS idx_iz_landing_blocks_tenant_public 
ON iz_landing_blocks(tenant_id, is_public);


