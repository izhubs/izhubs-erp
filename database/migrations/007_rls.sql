-- 007_rls.sql
-- PostgreSQL Row Level Security — dynamic approach
-- Introspects information_schema to only apply RLS on tables
-- that actually have a tenant_id column. Safe to run multiple times.

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['contacts','companies','deals','activities',
                          'import_jobs','custom_field_definitions','tenant_modules'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Only apply if table exists AND has tenant_id column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name   = t
        AND column_name  = 'tenant_id'
    ) THEN
      -- Enable RLS
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);

      -- Drop old policy if exists (idempotent)
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I',
                     t || '_tenant_isolation', t);

      -- Create permissive policy:
      --   bypass when setting is empty (migrations, admin)
      --   otherwise enforce tenant match
      EXECUTE format(
        $q$CREATE POLICY %I ON %I AS PERMISSIVE FOR ALL
           USING (
             COALESCE(current_setting('app.current_tenant_id', true), '') = ''
             OR tenant_id::text = current_setting('app.current_tenant_id', true)
           )$q$,
        t || '_tenant_isolation', t
      );

      RAISE NOTICE 'RLS enabled on table: %', t;
    ELSE
      RAISE NOTICE 'Skipped (no tenant_id): %', t;
    END IF;
  END LOOP;
END
$$;
