import { db } from '../core/engine/db';

async function main() {
  console.log('Running migration 020...');
  await db.query(`ALTER TABLE iz_forms ADD COLUMN IF NOT EXISTS webhook_url TEXT DEFAULT NULL`);
  await db.query(`ALTER TABLE iz_forms ADD COLUMN IF NOT EXISTS auto_convert_lead BOOLEAN NOT NULL DEFAULT false`);
  console.log('Migration 020 done — webhook_url + auto_convert_lead added');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
