import { db } from './core/engine/db';

async function main() {
  const res = await db.query(`SELECT id, name, industry FROM tenants`);
  console.log(res.rows);
  process.exit(0);
}

main().catch(console.error);
