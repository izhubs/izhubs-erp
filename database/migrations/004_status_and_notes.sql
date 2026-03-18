-- =============================================================
-- Migration 004: Contact Status + Notes System
-- Sprint 1 backbone: A2 (Status Tabs), C1 (Notes System)
-- =============================================================

-- A2: Add status column to contacts for tab filtering
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'status'
  ) THEN
    ALTER TABLE contacts ADD COLUMN status VARCHAR(20) DEFAULT 'lead';
  END IF;
END $$;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status) WHERE deleted_at IS NULL;

-- Set existing contacts to sensible defaults based on whether they have deals
UPDATE contacts SET status = 'customer' 
WHERE id IN (SELECT DISTINCT contact_id FROM deals WHERE contact_id IS NOT NULL AND deleted_at IS NULL)
AND status = 'lead';

-- C1: Notes table (polymorphic — attachable to contacts, deals, companies)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('contact', 'deal', 'company')),
  entity_id UUID NOT NULL,
  author_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for fast query: "get all notes for contact X"
CREATE INDEX IF NOT EXISTS idx_notes_entity ON notes(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_tenant ON notes(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
