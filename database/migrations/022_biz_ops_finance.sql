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
