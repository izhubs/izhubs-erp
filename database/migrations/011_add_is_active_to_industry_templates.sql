-- =============================================================
-- Migration 011: Add is_active flag to industry_templates
-- =============================================================

ALTER TABLE industry_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- By default, set all to false EXCEPT the ones we have actually built
-- Let's set virtual-office and coworking to true as they are the most complete
UPDATE industry_templates SET is_active = false;
UPDATE industry_templates SET is_active = true WHERE id IN ('virtual-office', 'coworking');
