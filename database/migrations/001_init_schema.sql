-- =============================================================
-- izhubs ERP — Migration 001: Initial Schema
-- Created: 2026-03-14
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---- Users ----
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL DEFAULT '',
  email       VARCHAR(255) NOT NULL UNIQUE,
  role        VARCHAR(50)  NOT NULL DEFAULT 'member'
                CHECK (role IN ('superadmin', 'admin', 'member', 'viewer')),
  password_hash VARCHAR(255),
  avatar_url  TEXT,
  active      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---- Companies ----
CREATE TABLE IF NOT EXISTS companies (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  website       VARCHAR(255),
  industry      VARCHAR(100),
  country       VARCHAR(10),
  city          VARCHAR(100),
  address       TEXT,
  custom_fields JSONB        NOT NULL DEFAULT '{}',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---- Contacts ----
CREATE TABLE IF NOT EXISTS contacts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255),
  phone         VARCHAR(50),
  title         VARCHAR(255),
  company_id    UUID        REFERENCES companies(id) ON DELETE SET NULL,
  owner_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  custom_fields JSONB        NOT NULL DEFAULT '{}',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---- Deals ----
CREATE TABLE IF NOT EXISTS deals (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  value         DECIMAL(15,2) NOT NULL DEFAULT 0,
  stage         VARCHAR(50)  NOT NULL DEFAULT 'new'
                CHECK (stage IN ('new','contacted','qualified','proposal','negotiation','won','lost')),
  contact_id    UUID        REFERENCES contacts(id) ON DELETE SET NULL,
  company_id    UUID        REFERENCES companies(id) ON DELETE SET NULL,
  owner_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  closed_at     TIMESTAMP,
  custom_fields JSONB        NOT NULL DEFAULT '{}',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---- Activities ----
CREATE TABLE IF NOT EXISTS activities (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type          VARCHAR(20)  NOT NULL
                CHECK (type IN ('call','email','meeting','note','task')),
  subject       VARCHAR(255) NOT NULL,
  body          TEXT,
  due_at        TIMESTAMP,
  completed_at  TIMESTAMP,
  contact_id    UUID        REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id       UUID        REFERENCES deals(id) ON DELETE CASCADE,
  company_id    UUID        REFERENCES companies(id) ON DELETE CASCADE,
  owner_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---- Custom Field Definitions ----
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   VARCHAR(20)  NOT NULL
                CHECK (entity_type IN ('contact','company','deal','activity')),
  key           VARCHAR(100) NOT NULL,
  label         VARCHAR(255) NOT NULL,
  type          VARCHAR(20)  NOT NULL
                CHECK (type IN ('text','number','date','boolean','select','multiselect','url','email','phone')),
  options       JSONB,
  required      BOOLEAN      NOT NULL DEFAULT false,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, key)
);

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_owner_due ON activities(owner_id, due_at);

-- ---- Default Super Admin (created via /setup on first run) ----
-- Actual admin is created through the setup UI, not hardcoded here
