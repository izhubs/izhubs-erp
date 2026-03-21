import { db } from './core/engine/db';

async function run() {
  const tenants = await db.query('SELECT id FROM tenants LIMIT 1');
  const tenantId = tenants.rows[0].id;
  
  const activePlugins = await db.query(
    `SELECT m.id, m.name, m.icon, m.category, tm.is_active, tm.tenant_id
     FROM modules m
     JOIN tenant_modules tm ON tm.module_id = m.id AND tm.tenant_id = $1
     WHERE tm.is_active = true AND m.category != 'core'`,
    [tenantId]
  );
  console.log('Active plugins for', tenantId, ':', activePlugins.rows);
  process.exit(0);
}
run().catch(console.error);
