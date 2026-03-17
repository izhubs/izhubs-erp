#!/usr/bin/env node
// =============================================================
// izhubs ERP — One-time Bootstrap for existing DBs
// 
// Problem: DB was created with old sequential migrations (001_init_schema 
// through 007_add_deals_stage_index). The new squashed migration system 
// uses different filenames (001_initial_schema.sql, 002_seed_data.sql).
//
// Solution:
//   1. Mark squashed files as applied in schema_migrations (skip them)
//   2. Create missing tables that didn't exist in old schema
//   3. Insert missing seed data (ON CONFLICT DO NOTHING)
//
// After this runs, `npm run db:migrate` will only run 003_industry_theme.sql.
// Usage: node scripts/_bootstrap-migration.js
// =============================================================

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
});

async function bootstrap() {
  const client = await pool.connect();
  console.log('🔧 Bootstrap migration starting...\n');

  try {
    await client.query('BEGIN');

    // ---- Step 1: Mark squashed migrations as applied so runner skips them ----
    const squashedFiles = ['001_initial_schema.sql', '002_seed_data.sql'];
    for (const f of squashedFiles) {
      await client.query(
        `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`,
        [f]
      );
      console.log(`  ✅ Marked as applied: ${f}`);
    }

    // ---- Step 2: Create missing tables (tenants, modules, tenant_modules) ----
    // These did not exist in the old sequential schema.
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255) NOT NULL,
        slug        VARCHAR(100) NOT NULL UNIQUE,
        plan        VARCHAR(50)  NOT NULL DEFAULT 'self-hosted'
                      CHECK (plan IN ('self-hosted', 'starter', 'pro', 'enterprise')),
        industry    VARCHAR(100),
        custom_theme_config JSONB NOT NULL DEFAULT '{}',
        settings    JSONB        NOT NULL DEFAULT '{}',
        active      BOOLEAN      NOT NULL DEFAULT true,
        created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
      )
    `);
    console.log('  ✅ Created/verified: tenants');

    await client.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id            VARCHAR(100) PRIMARY KEY,
        name          VARCHAR(255) NOT NULL,
        description   TEXT,
        version       VARCHAR(50)  NOT NULL DEFAULT '1.0.0',
        category      VARCHAR(100) NOT NULL
                        CHECK (category IN ('core', 'finance', 'operations', 'communication')),
        icon          VARCHAR(10),
        is_official   BOOLEAN      NOT NULL DEFAULT true,
        config_schema JSONB        NOT NULL DEFAULT '{}',
        created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
      )
    `);
    console.log('  ✅ Created/verified: modules');

    await client.query(`
      CREATE TABLE IF NOT EXISTS tenant_modules (
        tenant_id    UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        module_id    VARCHAR(100) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        is_active    BOOLEAN      NOT NULL DEFAULT false,
        config       JSONB        NOT NULL DEFAULT '{}',
        installed_at TIMESTAMP,
        updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tenant_id, module_id)
      )
    `);
    console.log('  ✅ Created/verified: tenant_modules');

    // ---- Step 3: Insert default tenant FIRST (before FK column) ----
    await client.query(`
      INSERT INTO tenants (id, name, slug, plan)
      VALUES ('00000000-0000-0000-0000-000000000001', 'Default', 'default', 'self-hosted')
      ON CONFLICT DO NOTHING
    `);
    console.log('  ✅ Default tenant ensured');

    // ---- Step 4: Add tenant_id column to users if missing ----
    // Must happen AFTER default tenant exists (FK constraint)
    const userCols = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id'`
    );
    if (userCols.rows.length === 0) {
      await client.query(`
        ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE 
          DEFAULT '00000000-0000-0000-0000-000000000001'
      `);
      // Backfill existing rows
      await client.query(`
        UPDATE users SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL
      `);
      console.log('  ✅ Added tenant_id to users + backfilled existing rows');
    } else {
      console.log('  ✅ users.tenant_id already exists');
    }

    // ---- Step 5: Insert official modules catalog ----
    await client.query(`
      INSERT INTO modules (id, name, description, version, category, icon, is_official) VALUES
        ('crm',          'CRM Pipeline',  'Manage deals pipeline and contacts. Kanban drag-drop.',            '1.0.0', 'core',       '📊', true),
        ('contracts',    'Contracts',     'Create and manage contracts with template support.',               '1.0.0', 'finance',    '📋', true),
        ('invoices',     'Invoices',      'Manage invoices, recurring billing, VAT export.',                 '1.0.0', 'finance',    '🧾', true),
        ('reports',      'Reports',       'MRR, Churn, Pipeline, Occupancy dashboards.',                     '1.0.0', 'operations', '📈', true),
        ('mail-log',     'Mail Log',      'Track inbound/outbound mail, notify clients on status.',           '1.0.0', 'operations', '📬', true),
        ('room-booking', 'Room Booking',  'Manage room/hot-desk bookings by hour or day.',                   '1.0.0', 'operations', '🗓️', true),
        ('automation',   'Automation',    'Trigger → Condition → Action. Follow-up reminders, auto-email.', '1.0.0', 'operations', '⚡', true)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('  ✅ Official modules catalog seeded');

    // ---- Step 6: Add index if missing ----
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON tenant_modules(tenant_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tenant_modules_active ON tenant_modules(tenant_id, is_active)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tenants_industry ON tenants(industry)`);

    await client.query('COMMIT');
    console.log('\n✅ Bootstrap complete! Run `npm run db:migrate` to apply 003_industry_theme.sql\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Bootstrap FAILED:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

bootstrap();
