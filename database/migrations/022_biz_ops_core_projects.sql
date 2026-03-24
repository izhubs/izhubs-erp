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
