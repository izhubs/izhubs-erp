#!/usr/bin/env node
// =============================================================
// izhubs ERP — Migration Runner
// Runs pending SQL migrations in sequential order.
// Tracks state in schema_migrations table.
//
// Usage:
//   node scripts/migrate.js
//   npm run db:migrate
// =============================================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
});

const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     VARCHAR(255) PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT version FROM schema_migrations ORDER BY version');
  return new Set(result.rows.map(r => r.version));
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    // Get all .sql files, sorted numerically
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort(); // lexicographic sort works because files are zero-padded: 001_, 002_, ...

    const pending = files.filter(f => !applied.has(f));

    if (pending.length === 0) {
      console.log('✅ All migrations already applied.');
      return;
    }

    console.log(`🔄 Running ${pending.length} pending migration(s)...`);

    for (const file of pending) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✅ ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ ${file} FAILED:`, err.message);
        process.exit(1);
      }
    }

    console.log('✅ All migrations applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(err => {
  console.error('Migration runner failed:', err);
  process.exit(1);
});
