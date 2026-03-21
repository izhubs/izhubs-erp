const { Client } = require('pg');
async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp'
  });
  try {
    await client.connect();
    await client.query("DELETE FROM tenant_modules WHERE module_id NOT IN ('crm', 'izform')");
    await client.query("DELETE FROM modules WHERE id NOT IN ('crm', 'izform')");
    console.log('Dummy modules removed.');
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}
run();
