import { db } from '../core/engine/db';
import { getNavConfig } from '../lib/nav-config';

async function main() {
  const tenants = await db.query("SELECT id FROM tenants WHERE name = 'Agency Demo'");
  if (tenants.rows.length === 0) return;
  const tId = tenants.rows[0].id;

  console.log('Fetching for ', tId);

  // Raw query 
  const activePlugins = await db.query(
    `SELECT m.id, m.name, m.icon, tm.config
     FROM modules m
     JOIN tenant_modules tm ON tm.module_id = m.id AND tm.tenant_id = $1
     WHERE tm.is_active = true AND m.category != 'core'`,
    [tId]
  );
  console.log('Raw Active Plugins:', activePlugins.rows);

  console.log('Calling getNavConfig...');
  const nav = await getNavConfig(tId, 'superadmin');
  console.log('Nav Sidebar Plugins:', nav?.sidebar?.filter(i => i.id?.startsWith('plugin-')));
  
  process.exit(0);
}
main().catch(console.error);
