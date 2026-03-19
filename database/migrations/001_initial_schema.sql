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
