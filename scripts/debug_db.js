const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  // Check users columns
  const cols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position"
  );
  console.log('=== users columns ===');
  cols.rows.forEach(c => console.log(' ', c.column_name, '-', c.data_type));

  // Test actual INSERT matching register route
  try {
    const r = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, active',
      ['TestUser', 'test_debug@test.com', 'fakehash:fakehash', 'member']
    );
    console.log('\n=== INSERT OK ===', r.rows[0]);
    await pool.query("DELETE FROM users WHERE email = 'test_debug@test.com'");
  } catch (err) {
    console.error('\n=== INSERT FAILED ===', err.code, err.message);
  }

  await pool.end();
}

main().catch(console.error);
