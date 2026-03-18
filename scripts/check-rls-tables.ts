#!/usr/bin/env tsx
import { db } from '../core/engine/db';

const tables = ['contacts','companies','deals','activities','import_jobs','custom_field_definitions','tenant_modules'];
for (const t of tables) {
  const r = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name='${t}' AND column_name='tenant_id'`);
  console.log(t + ':', r.rows.length > 0 ? '✅ HAS tenant_id' : '❌ NO tenant_id');
}
process.exit(0);
