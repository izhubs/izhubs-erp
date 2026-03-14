/**
 * Seed: Test Users
 * Run: npx ts-node --project tsconfig.json database/seeds/seed-test-users.ts
 *
 * Creates one user per role for local development and testing.
 * DO NOT run in production.
 */
import { Pool } from 'pg';
import { scryptSync, randomBytes } from 'crypto';

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/izhubs_erp',
});

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

const TEST_PASSWORD = 'Test1234!';

const USERS = [
  { name: 'Super Admin',  email: 'superadmin@izhubs.local', role: 'superadmin' },
  { name: 'Admin User',   email: 'admin@izhubs.local',      role: 'admin' },
  { name: 'Member User',  email: 'member@izhubs.local',     role: 'member' },
  { name: 'Viewer User',  email: 'viewer@izhubs.local',     role: 'viewer' },
];

async function run() {
  console.log('🌱 Seeding test users...\n');

  for (const user of USERS) {
    const hash = hashPassword(TEST_PASSWORD);
    await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE
         SET name = EXCLUDED.name,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role`,
      [user.name, user.email, hash, user.role]
    );
    console.log(`  ✅ ${user.role.padEnd(12)} → ${user.email}`);
  }

  console.log(`\n  Password for all: ${TEST_PASSWORD}`);
  await db.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
