-- database/migrations/003_social_pages_schema.sql

-- 1. Table for mapped Social Media Pages (Fanpages)
CREATE TABLE IF NOT EXISTS social_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- e.g. 'facebook_page', 'instagram_business', 'tiktok_account'
    external_page_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    access_token TEXT, -- Stores the encrypted or raw Page Access Token (which is isolated from User Tokens)
    is_sync_enabled BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure a page is only mapped once per platform per tenant
    UNIQUE(tenant_id, platform, external_page_id)
);

-- 2. Table for daily organic performance metrics
CREATE TABLE IF NOT EXISTS social_page_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES social_pages(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Specific metrics (Focusing on the requested Facebook Insights)
    reach BIGINT DEFAULT 0, -- page_impressions_unique
    engagement BIGINT DEFAULT 0, -- page_engaged_users
    new_followers INT DEFAULT 0, -- page_follows
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- A page can only have 1 metric record per day
    UNIQUE(page_id, date)
);

-- Update triggers for timestamping
CREATE TRIGGER update_social_pages_updated_at
    BEFORE UPDATE ON social_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_page_metrics_updated_at
    BEFORE UPDATE ON social_page_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
