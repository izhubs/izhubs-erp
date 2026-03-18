-- =============================================================
-- izhubs ERP — Service Packages Table
-- Tracks recurring service packages available per tenant.
-- Deals reference packages via package_id foreign key.
-- =============================================================

CREATE TABLE IF NOT EXISTS service_packages (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,
  description TEXT,
  price       NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency    TEXT          NOT NULL DEFAULT 'VND',
  billing     TEXT          NOT NULL DEFAULT 'monthly'  -- monthly | yearly | one_time
    CHECK (billing IN ('monthly', 'yearly', 'one_time')),
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

-- Index for tenant scoped queries
CREATE INDEX IF NOT EXISTS service_packages_tenant_idx
  ON service_packages(tenant_id)
  WHERE deleted_at IS NULL;

-- Add package_id to deals table if not present
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL;

-- Optional: updated_at auto-trigger (reuse existing function if any)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_packages_updated_at ON service_packages;
CREATE TRIGGER service_packages_updated_at
  BEFORE UPDATE ON service_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Notes:
-- table.top_customers widget joins deals → service_packages via package_id
-- chart.revenue_by_pkg widget groups by service_packages.name
