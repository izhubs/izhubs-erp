import { db } from '../core/engine/db';

async function main() {
  console.log("Expanding icon column length and translating...");
  await db.query(`ALTER TABLE modules ALTER COLUMN icon TYPE VARCHAR(100)`);
  
  await db.query(`
    UPDATE modules 
    SET icon = 'ClipboardList',
        version = '0.1.0'
    WHERE id = 'izform'
  `);
  console.log("Done!");
  process.exit(0);
}
main().catch(console.error);
