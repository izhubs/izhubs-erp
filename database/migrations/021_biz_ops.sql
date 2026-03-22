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
