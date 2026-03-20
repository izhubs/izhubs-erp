-- ============================================================
-- Migration 013: Centralized Audit Triggers
-- 
-- Approach: One shared PL/pgSQL trigger function that captures
-- INSERT / UPDATE / DELETE on all core business tables.
-- The user_id is read from the session variable 
-- 'audit.current_user_id' set by the application layer.
--
-- Tables covered:
--   deals, contacts, companies, notes, activities,
--   service_packages, custom_field_definitions
-- ============================================================

-- Step 1: Create the shared audit trigger function
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id    UUID;
  v_action     TEXT;
  v_before     JSONB;
  v_after      JSONB;
BEGIN
  -- Read the user ID set by the app before each query
  BEGIN
    v_user_id := NULLIF(current_setting('audit.current_user_id', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL; -- Graceful fallback for migrations / scripts
  END;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_before := NULL;
    v_after  := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_before := to_jsonb(OLD);
    v_after  := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_before := to_jsonb(OLD);
    v_after  := NULL;
  END IF;

  -- Skip soft-deletes that masquerade as updates (they are already logged by DELETE-like UPDATE)
  -- Only skip pure internal "updated_at" touches with no real field change
  IF TG_OP = 'UPDATE' AND v_before - 'updated_at' = v_after - 'updated_at' THEN
    RETURN NEW; -- No meaningful change, skip
  END IF;

  INSERT INTO audit_log (entity_type, entity_id, action, user_id, before, after)
  VALUES (
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN (v_before->>'id')::UUID
      ELSE (v_after->>'id')::UUID
    END,
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

-- Step 2: Attach the trigger to all core business tables
-- Using a DO block to avoid repetition

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'deals',
    'contacts',
    'companies',
    'notes',
    'activities',
    'service_packages',
    'custom_field_definitions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Drop existing trigger to allow re-running this migration safely
    EXECUTE format('DROP TRIGGER IF EXISTS trg_audit ON %I', t);
    
    -- Create the trigger (AFTER to capture final state)
    EXECUTE format(
      'CREATE TRIGGER trg_audit
       AFTER INSERT OR UPDATE OR DELETE ON %I
       FOR EACH ROW EXECUTE FUNCTION fn_audit_log()',
      t
    );
  END LOOP;
END;
$$;

-- Step 3: Set the session variable from API layer
-- The application MUST call this before any mutation:
--   SET LOCAL audit.current_user_id = '<user-uuid>';
-- This is done via db.queryAsTenant() or a new db.queryAsUser() helper.

COMMENT ON FUNCTION fn_audit_log() IS
  'Centralized audit log trigger. Captures all INSERT/UPDATE/DELETE on business tables.
   Reads user identity from session variable audit.current_user_id.
   Applied to: deals, contacts, companies, notes, activities, service_packages, custom_field_definitions.';
