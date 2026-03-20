-- Migration 015: Ephemeral demo users
-- Each demo session creates a new user with is_demo=true.
-- Cleanup: after 24h or when user clicks Reset, delete the tenant → 
-- CASCADE deletes all related data (users, deals, contacts, notes, audit_log).

-- 1. Add demo fields to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS is_demo    BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 2. Add demo field to tenants table for easy cascade cleanup
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS is_demo    BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 3. Add index for efficient cleanup queries  
CREATE INDEX IF NOT EXISTS idx_users_demo_expiry   ON users(is_demo, expires_at)   WHERE is_demo = true;
CREATE INDEX IF NOT EXISTS idx_tenants_demo_expiry ON tenants(is_demo, expires_at) WHERE is_demo = true;

-- 4. Audit log: change user_id FK to CASCADE DELETE so demo user deletion
--    automatically removes their logs. Real users with NULL user_id are unaffected.
ALTER TABLE audit_log 
  DROP CONSTRAINT IF EXISTS audit_log_user_id_fkey,
  ADD CONSTRAINT audit_log_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMENT ON COLUMN users.is_demo    IS 'True for ephemeral demo users created at demo-login. Cleaned up after expires_at.';
COMMENT ON COLUMN users.expires_at IS 'Expiry time for demo users. NULL = permanent user.';
COMMENT ON COLUMN tenants.is_demo  IS 'True for ephemeral demo tenants. Cascade-deletes all data when dropped.';
