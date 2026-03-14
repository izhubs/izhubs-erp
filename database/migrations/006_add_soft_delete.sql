-- =============================================================
-- Migration 006: Soft-delete support
-- Adds deleted_at to contacts, deals, companies, activities.
-- Records with deleted_at IS NOT NULL are considered deleted.
-- Hard DELETE is permanently forbidden at the application layer.
-- =============================================================

ALTER TABLE contacts  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE deals     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_contacts_deleted  ON contacts(deleted_at)  WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_deleted     ON deals(deleted_at)     WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_deleted ON companies(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_deleted ON activities(deleted_at) WHERE deleted_at IS NOT NULL;
