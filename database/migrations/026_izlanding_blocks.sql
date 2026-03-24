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
