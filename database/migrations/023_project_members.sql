-- =========================================================================
-- izhubs ERP — Biz-Ops Plugin — Migration 023
-- Team Members Mapping
-- =========================================================================

CREATE TABLE IF NOT EXISTS project_members (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, manager, member, guest
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (campaign_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_campaign_id ON project_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
