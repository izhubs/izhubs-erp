const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp' });

async function main() {
  const tables = await p.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  );
  console.log('\n=== Existing tables ===');
  tables.rows.forEach(r => console.log(' ', r.table_name));

  try {
    const migs = await p.query(`SELECT version, applied_at FROM schema_migrations ORDER BY version`);
    console.log('\n=== Applied migrations ===');
    migs.rows.forEach(r => console.log(' ', r.version, '->', r.applied_at));
  } catch {
    console.log('\n=== schema_migrations table does not exist ===');
  }

  try {
    const cols = await p.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='tenants' ORDER BY ordinal_position`
    );
    console.log('\n=== tenants columns ===');
    cols.rows.forEach(r => console.log(' ', r.column_name));
  } catch { console.log('tenants not found'); }

  await p.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
