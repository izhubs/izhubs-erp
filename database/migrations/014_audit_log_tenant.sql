-- Migration 014: Add tenant_id to audit_log and update trigger
-- Needed because trigger writes user_id=NULL (no session context)
-- causing LEFT JOIN tenant filter to fail → empty UI

-- 1. Add tenant_id column
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- 2. Add index for efficient tenant queries
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON audit_log(tenant_id);

-- 3. Update the trigger function to also capture tenant_id from session
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id    UUID;
  v_tenant_id  UUID;
  v_action     TEXT;
  v_before     JSONB;
  v_after      JSONB;
BEGIN
  -- Read user + tenant from app session variables (set by engine layer)
  BEGIN
    v_user_id := NULLIF(current_setting('audit.current_user_id', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  BEGIN
    v_tenant_id := NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_tenant_id := NULL;
  END;

  -- Fallback: try to get tenant_id from the row itself if not set in session
  IF v_tenant_id IS NULL THEN
    BEGIN
      IF TG_OP = 'DELETE' THEN
        v_tenant_id := (to_jsonb(OLD)->>'tenant_id')::UUID;
      ELSE
        v_tenant_id := (to_jsonb(NEW)->>'tenant_id')::UUID;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_tenant_id := NULL;
    END;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_before := NULL;
    v_after  := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_before := to_jsonb(OLD);
    v_after  := to_jsonb(NEW);
    -- Skip if only updated_at changed
    IF v_before - 'updated_at' = v_after - 'updated_at' THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_before := to_jsonb(OLD);
    v_after  := NULL;
  END IF;

  INSERT INTO audit_log (entity_type, entity_id, tenant_id, action, user_id, before, after)
  VALUES (
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN (v_before->>'id')::UUID
      ELSE (v_after->>'id')::UUID
    END,
    v_tenant_id,
    v_action,
    v_user_id,
    v_before,
    v_after
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;
