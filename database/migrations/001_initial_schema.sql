-- =============================================================
-- izhubs ERP — Initial Schema (Squashed)
-- Created: 2026-03-17
-- This is the single source of truth for the database schema.
-- Squashed from migrations 001–011 for a clean fresh-install experience.
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TENANTS (multi-tenant foundation, single-tenant default)
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  plan        VARCHAR(50)  NOT NULL DEFAULT 'self-hosted'
                CHECK (plan IN ('self-hosted', 'starter', 'pro', 'enterprise')),
  settings    JSONB        NOT NULL DEFAULT '{}',
  active      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
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
  custom_fields JSONB        NOT NULL DEFAULT '{}',
  deleted_at    TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
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
  column_mapping JSONB        NOT NULL DEFAULT '{}',  -- AI-proposed + user-confirmed mapping
  raw_sample     JSONB        NOT NULL DEFAULT '[]',  -- first 5 rows for preview
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
-- INDEXES
-- ============================================================
-- Tenant scoping (critical for multi-tenant query performance)
CREATE INDEX IF NOT EXISTS idx_users_tenant          ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant      ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant       ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_tenant          ON deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant     ON activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_tenant ON import_jobs(tenant_id);

-- Core relations
CREATE INDEX IF NOT EXISTS idx_contacts_company      ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner        ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact         ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company         ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner           ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage           ON deals(stage) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_activities_contact    ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal       ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_owner_due  ON activities(owner_id, due_at);

-- Soft-delete fast scans
CREATE INDEX IF NOT EXISTS idx_contacts_deleted      ON contacts(deleted_at)   WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_deleted         ON deals(deleted_at)      WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_deleted     ON companies(deleted_at)  WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_deleted    ON activities(deleted_at) WHERE deleted_at IS NOT NULL;

-- Audit & webhook
CREATE INDEX IF NOT EXISTS idx_audit_log_user        ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity      ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created     ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);

-- Module registry
CREATE INDEX IF NOT EXISTS idx_modules_category      ON modules(category);
CREATE INDEX IF NOT EXISTS idx_modules_is_official   ON modules(is_official);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON tenant_modules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_active ON tenant_modules(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_modules_module ON tenant_modules(module_id);
