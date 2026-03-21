-- =============================================================
-- Migration 016: izForm Plugin
-- Tables: iz_forms, iz_form_submissions
-- =============================================================

CREATE TABLE iz_forms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  fields      JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX iz_forms_tenant_idx ON iz_forms(tenant_id)
  WHERE deleted_at IS NULL;

CREATE TABLE iz_form_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id      UUID NOT NULL REFERENCES iz_forms(id),
  tenant_id    UUID NOT NULL,
  data         JSONB NOT NULL,
  contact_id   UUID REFERENCES contacts(id),
  ip_address   VARCHAR(50),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX iz_form_submissions_form_idx ON iz_form_submissions(form_id);
CREATE INDEX iz_form_submissions_tenant_idx ON iz_form_submissions(tenant_id);

-- Seed izform plugin into modules catalog
INSERT INTO modules (id, name, description, version, category, icon, is_official, config_schema)
VALUES (
  'izform',
  'izForm — Lead Capture Forms',
  'Create custom lead capture forms and embed them into your marketing sites via iframe.',
  '1.0.0',
  'operations',
  '📋',
  true,
  '{}'
) ON CONFLICT (id) DO NOTHING;
