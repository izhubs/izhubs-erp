-- 007_rls.sql
-- PostgreSQL Row Level Security (RLS)
-- Tenant isolation backstop at DB level.
-- Tables: contacts, companies, deals, activities, import_jobs,
--         custom_field_definitions, tenant_modules
--
-- Pattern: check app.current_tenant_id session var (set by db.queryAsTenant)
-- Passthrough if var is empty (migrations, scripts, admin ops)

-- -------- CONTACTS --------
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contacts_tenant_isolation ON contacts;
CREATE POLICY contacts_tenant_isolation ON contacts AS PERMISSIVE
  FOR ALL USING (
    COALESCE(current_setting('app.current_tenant_id', true), '') = ''
    OR tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- -------- COMPANIES --------
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS companies_tenant_isolation ON companies;
CREATE POLICY companies_tenant_isolation ON companies AS PERMISSIVE
  FOR ALL USING (
    COALESCE(current_setting('app.current_tenant_id', true), '') = ''
    OR tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- -------- DEALS --------
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deals_tenant_isolation ON deals;
CREATE POLICY deals_tenant_isolation ON deals AS PERMISSIVE
  FOR ALL USING (
    COALESCE(current_setting('app.current_tenant_id', true), '') = ''
    OR tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- -------- ACTIVITIES --------
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS activities_tenant_isolation ON activities;
CREATE POLICY activities_tenant_isolation ON activities AS PERMISSIVE
  FOR ALL USING (
    COALESCE(current_setting('app.current_tenant_id', true), '') = ''
    OR tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- -------- IMPORT_JOBS --------
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS import_jobs_tenant_isolation ON import_jobs;
CREATE POLICY import_jobs_tenant_isolation ON import_jobs AS PERMISSIVE
  FOR ALL USING (
    COALESCE(current_setting('app.current_tenant_id', true), '') = ''
    OR tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- -------- CUSTOM_FIELD_DEFINITIONS --------
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS custom_fields_tenant_isolation ON custom_field_definitions;
CREATE POLICY custom_fields_tenant_isolation ON custom_field_definitions AS PERMISSIVE
  FOR ALL USING (
    COALESCE(current_setting('app.current_tenant_id', true), '') = ''
    OR tenant_id::text = current_setting('app.current_tenant_id', true)
  );

-- -------- TENANT_MODULES --------
-- Primary key IS tenant_id — no uuid cast needed
ALTER TABLE tenant_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_modules FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_modules_isolation ON tenant_modules;
CREATE POLICY tenant_modules_isolation ON tenant_modules AS PERMISSIVE
  FOR ALL USING (
    COALESCE(current_setting('app.current_tenant_id', true), '') = ''
    OR tenant_id::text = current_setting('app.current_tenant_id', true)
  );
