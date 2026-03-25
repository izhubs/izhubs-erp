-- =========================================================================
-- izhubs ERP - Migration 002: Biz-Ops Digital Sync Engine (Integration Hub)
-- =========================================================================

-- 1. Integration Connections (OAuth Storage)
CREATE TABLE IF NOT EXISTS integration_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'facebook', 'google_ads', 'tiktok'
    credentials JSONB NOT NULL, -- Encrypted tokens from OAuth
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'disconnected', 'error'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

CREATE INDEX idx_integration_connections_tenant ON integration_connections(tenant_id);

-- 2. Ad Accounts (Fetched from Business Manager/MCC)
CREATE TABLE IF NOT EXISTS ad_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'facebook_ads', 'google_ads'
    external_account_id VARCHAR(100) NOT NULL, -- e.g. 'act_123456789'
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    timezone VARCHAR(100) DEFAULT 'UTC',
    is_sync_enabled BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, platform, external_account_id)
);

CREATE INDEX idx_ad_accounts_connection ON ad_accounts(connection_id);

-- 3. Campaign Ad Sources (Mapping izhubs Campaign <-> Facebook/Google Campaigns)
CREATE TABLE IF NOT EXISTS campaign_ad_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES biz_ops_campaigns(id) ON DELETE CASCADE,
    ad_account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
    external_campaign_id VARCHAR(100) NOT NULL,
    external_campaign_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, ad_account_id, external_campaign_id)
);

CREATE INDEX idx_campaign_ad_sources_campaign ON campaign_ad_sources(campaign_id);

-- 4. Campaign Digital Metrics (Daily Snapshots / Data Warehouse)
CREATE TABLE IF NOT EXISTS campaign_digital_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES biz_ops_campaigns(id) ON DELETE CASCADE,
    ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    spend DECIMAL(15, 2) DEFAULT 0,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    roas DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, ad_account_id, date)
);

CREATE INDEX idx_metrics_campaign_date ON campaign_digital_metrics(campaign_id, date);

-- 5. Expand biz_ops_expenses logic to support auto-sync source
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='biz_ops_expenses' AND column_name='source_type'
    ) THEN
        ALTER TABLE biz_ops_expenses ADD COLUMN source_type VARCHAR(50) DEFAULT 'manual';
    END IF;
END $$;
