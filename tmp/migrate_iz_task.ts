import { db } from '@/core/engine/db';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  console.log('Migrating Database: 024_iz_task.sql');
  const sqlContent = fs.readFileSync(path.join(process.cwd(), 'database/migrations/024_iz_task.sql'), 'utf-8');
  
  try {
    await db.query(sqlContent);
    console.log('Migration successful!');
    process.exit(0);
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();
