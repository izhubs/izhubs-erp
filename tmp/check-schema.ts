import { db } from '../core/engine/db';

async function main() {
  const r = await db.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'contacts' ORDER BY ordinal_position"
  );
  console.log(JSON.stringify(r.rows, null, 2));
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
