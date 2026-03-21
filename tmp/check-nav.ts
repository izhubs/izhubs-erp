import { db } from '../core/engine/db';
import { getNavConfig } from '../lib/nav-config';

async function main() {
  const tenantId = '00000000-0000-0000-0000-000000000001';

  console.log('1. Checking tenant_modules...');
  const modulesRes = await db.query(
    'SELECT module_id, is_active, config FROM tenant_modules WHERE tenant_id = $1',
    [tenantId]
  );
  console.log(modulesRes.rows);

  console.log('\n2. Calling getNavConfig for SuperAdmin directly from DB...');
  const activePlugins = await db.query(
    `SELECT m.id, m.name, m.icon, tm.config
     FROM modules m
     JOIN tenant_modules tm ON tm.module_id = m.id AND tm.tenant_id = $1
     WHERE tm.is_active = true AND m.category != 'core'`,
    [tenantId]
  );
  console.log('Active plugins from DB JOIN:', activePlugins.rows);

  console.log('\n3. Calling getNavConfig wrapper...');
  const nav = await getNavConfig(tenantId, 'superadmin');
  console.log(JSON.stringify(nav?.sidebar, null, 2));

  process.exit(0);
}

main().catch(console.error);
