-- =============================================================
-- izhubs ERP — Migration 008: Fix Deal Stages
-- Reason: Expand allowed stages to support all industrial seeds (Restaurant, Freelancer, etc.)
-- =============================================================

-- 1. Drop the old restrictive constraint
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_stage_check;

-- 2. Add a much more inclusive constraint
-- This includes standard CRM stages plus industry-specific ones (F&B, Freelancer, Co-working)
ALTER TABLE deals ADD CONSTRAINT deals_stage_check CHECK (
  stage IN (
    -- Standard CRM
    'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'lead', 
    -- Operations / Project
    'onboarding', 'active', 'revision', 'completed', 'cancelled', 'pending', 'renewal',
    -- Restaurant / F&B
    'inquiry', 'reservation', 'confirmed', 'seated',
    -- Coworking stages
    'tour_scheduled', 'tour_completed', 'member_active',
    -- Coworking legacy / pipeline stages
    'consulting', 'site_visit', 'closing', 'referred', 'quoted'
  )
);
