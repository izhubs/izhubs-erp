/**
 * core/engine/demo.ts
 * ============================================================
 * Programmatic seeding for demo tenants.
 * Called by the /api/v1/demo-login endpoint.
 *
 * Strategy:
 *  - Each industry gets a dedicated demo tenant (slug: demo-agency, etc)
 *  - Demo data is wiped + reseeded on each call for a fresh experience
 *  - 3 demo users per tenant: CEO (admin), Sale (member), Ops (member)
 * ============================================================
 */

import { db } from './db';
import { Pool } from 'pg';
import crypto from 'crypto';
import { type IndustryId, type RoleId, ROLES } from '../types/demo';

// Re-export for convenience — consumers can import from here or from core/types/demo
export type { IndustryId as DemoIndustry, RoleId as DemoRole };

export interface DemoLoginResult {
  tenantId: string;
  userId: string;
  email: string;
  role: string; // The actual RBAC role from the users table
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

// Derived from ROLES registry — ROLES is the single source of truth
// for role labels, descriptions, and icon.

/**
 * Get or create a demo tenant for the given industry and seed it with fresh data.
 * Returns the tenant ID and user info for the requested role.
 */
export async function getDemoSession(industry: IndustryId, demoRole: RoleId): Promise<DemoLoginResult> {
  const slug = `demo-${industry}`;
  const industryLabel = industry.charAt(0).toUpperCase() + industry.slice(1);

  // Create or ensure demo tenant exists
  const tenantResult = await db.query(
    `INSERT INTO tenants (name, slug, plan, active)
     VALUES ($1, $2, 'self-hosted', true)
     ON CONFLICT (slug) DO UPDATE SET active = true
     RETURNING id`,
    [`Demo: ${industryLabel}`, slug]
  );
  const tenantId: string = tenantResult.rows[0].id;

  // Check if this tenant already has seeded users
  const existingCheck = await db.query(
    `SELECT id, email, role FROM users WHERE tenant_id = $1 AND email LIKE $2 LIMIT 3`,
    [tenantId, `demo_${industry}_%@izhubs.com`]
  );

  // Only reseed if not seeded yet (avoids wiping data mid-session)
  if (existingCheck.rowCount === 0) {
    await seedDemoIndustry(tenantId, industry);
  }

  // Fetch the user for the requested role — lookup from shared ROLES registry
  const { rbacRole: role } = ROLES[demoRole];
  const emailPattern = `demo_${industry}_${demoRole}@izhubs.com`;
  const userResult = await db.query(
    `SELECT id, email, role FROM users WHERE tenant_id = $1 AND email = $2`,
    [tenantId, emailPattern]
  );

  if (!userResult.rowCount) {
    throw new Error(`Demo user not found for industry=${industry} role=${demoRole}`);
  }

  const user = userResult.rows[0];
  return { tenantId, userId: user.id, email: user.email, role: user.role };
}

/**
 * Seed demo data for a specific tenant. Creates 3 users (CEO/Sale/Ops)
 * and delegates contact/deal seeding to the industry seed module.
 */
async function seedDemoIndustry(tenantId: string, industry: IndustryId) {
  // Create 3 role-specific users
  const users = [
    { email: `demo_${industry}_ceo@izhubs.com`,  name: 'Demo CEO',  role: 'admin'  as const },
    { email: `demo_${industry}_sale@izhubs.com`, name: 'Demo Sales', role: 'member' as const },
    { email: `demo_${industry}_ops@izhubs.com`,  name: 'Demo Ops',   role: 'member' as const },
  ];

  const userIds: Record<string, string> = {};
  for (const u of users) {
    const res = await db.query(
      `INSERT INTO users (name, email, password_hash, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET tenant_id = EXCLUDED.tenant_id
       RETURNING id`,
      [u.name, u.email, hashPassword('Demo@12345'), u.role, tenantId]
    );
    userIds[u.email] = res.rows[0].id;
  }

  // Use the CEO user as owner for seed data
  const ownerId = userIds[`demo_${industry}_ceo@izhubs.com`];

  // Load and run industry-specific seed data
  const seedPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
  });
  const { runSeed } = require('../../scripts/seeds/_base');
  const industryModule = require(`../../scripts/seeds/seed-${industry}`);

  // Override the adminUser email to match our demo user
  industryModule.adminUser = { ...industryModule.adminUser, email: `demo_${industry}_ceo@izhubs.com` };

  try {
    await runSeed(industryModule, tenantId);
  } finally {
    await seedPool.end();
  }
}
