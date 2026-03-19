#!/usr/bin/env node
// =============================================================
// izhubs ERP — DB Reset Runner
// Drops the public schema, recreates it, and runs migrations.
//
// Usage:
//   node scripts/db-reset.js
//   npm run db:reset
// =============================================================

const { Pool } = require('pg');
const { execSync } = require('child_process');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
});

async function resetDb() {
  const client = await pool.connect();
  try {
    console.log('🔄 Dropping public schema...');
    await client.query('DROP SCHEMA public CASCADE');
    console.log('🔄 Recreating public schema...');
    await client.query('CREATE SCHEMA public');
    console.log('✅ Public schema reset successfully.');

    // Execute migrate script
    console.log('🔄 Running migrations...');
    execSync('node scripts/migrate.js', { stdio: 'inherit' });
    
  } catch (err) {
    console.error('❌ DB Reset failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDb();
