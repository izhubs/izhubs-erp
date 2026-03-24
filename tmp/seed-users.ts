import { db } from '@/core/engine/db';
import { hashPassword } from '@/core/engine/auth/crypto';
import { randomUUID } from 'crypto';

async function run() {
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const passwordHash = await hashPassword('izhubs2026');

  console.log('Seeding users for tenant:', tenantId);

  const users = [
    { name: 'Alice Admin', email: 'admin@izhubs.local', role: 'admin' },
    { name: 'Bob Member', email: 'member@izhubs.local', role: 'member' },
    { name: 'Charlie Viewer', email: 'viewer@izhubs.local', role: 'viewer' },
    { name: 'Eve Inactive', email: 'eve@izhubs.local', role: 'member', active: false },
  ];

  for (const u of users) {
    const active = u.active !== undefined ? u.active : true;
    try {
      await db.query(`
        INSERT INTO users (id, tenant_id, name, email, password_hash, role, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE 
        SET role = EXCLUDED.role, active = EXCLUDED.active
      `, [randomUUID(), tenantId, u.name, u.email, passwordHash, u.role, active]);
      console.log(`Seeded: ${u.name} (${u.role})`);
    } catch (e: any) {
      console.error(`Error inserting ${u.name}:`, e.message);
    }
  }

  console.log('Done.');
  process.exit(0);
}

run();
