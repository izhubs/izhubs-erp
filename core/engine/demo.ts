/**
 * core/engine/demo.ts
 * ============================================================
 * Ephemeral demo session management.
 *
 * Each call to getDemoSession() creates:
 *   - A unique demo tenant (e.g. "Demo Agency #a3f2")
 *   - A single demo user tied to that tenant
 *   - Full industry seed data for that tenant
 *
 * Lifecycle:
 *   - Tenant + user expire after 24h or when user clicks Reset
 *   - Deleting the tenant CASCADE-deletes: users, deals, contacts,
 *     notes, activities, audit_log (all via FK ON DELETE CASCADE)
 *
 * Cleanup:
 *   - Lazy: expired demo tenants are purged at start of each session
 *   - Manual: DELETE /api/v1/tenant/reset-demo-data drops the tenant
 * ============================================================
 */

import { db } from './db';
import crypto from 'crypto';
import { type IndustryId, type RoleId, ROLES } from '../types/demo';
import { Pool } from 'pg';

export type { IndustryId as DemoIndustry, RoleId as DemoRole };

export interface DemoLoginResult {
  tenantId: string;
  userId:   string;
  email:    string;
  role:     string;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

/** Short random suffix for display names (e.g. "#a3f2") */
function shortId() {
  return crypto.randomBytes(3).toString('hex');
}

/**
 * Create a new ephemeral demo session.
 * Each call provisions a fresh isolated tenant + user.
 * Expires after 24 hours.
 */
export async function getDemoSession(industry: IndustryId, demoRole: RoleId): Promise<DemoLoginResult> {
  // 1. Lazy cleanup — delete expired demo tenants (and all their cascade data)
  await db.query(
    `DELETE FROM tenants WHERE is_demo = true AND expires_at < NOW()`
  );

  const industryLabel = industry.charAt(0).toUpperCase() + industry.slice(1);
  const sessionId     = shortId();
  const slug          = `demo-${industry}-${sessionId}`;
  const { rbacRole: role, label: roleLabel } = ROLES[demoRole];

  // 2. Create isolated demo tenant (expires in 24h)
  const tenantResult = await db.query(
    `INSERT INTO tenants (name, slug, plan, active, is_demo, expires_at, industry)
     VALUES ($1, $2, 'self-hosted', true, true, NOW() + INTERVAL '24 hours', $3)
     RETURNING id`,
    [`${industryLabel} Demo`, slug, industry]
  );
  const tenantId: string = tenantResult.rows[0].id;

  // 3. Create a single ephemeral user for this session
  const guestName  = `Demo ${roleLabel} #${sessionId}`;
  const guestEmail = `demo_${sessionId}_${demoRole}@demo.izhubs.local`;

  const userResult = await db.query(
    `INSERT INTO users (name, email, password_hash, role, tenant_id, is_demo, expires_at)
     VALUES ($1, $2, $3, $4, $5, true, NOW() + INTERVAL '24 hours')
     RETURNING id, email, role`,
    [guestName, guestEmail, hashPassword(crypto.randomBytes(16).toString('hex')), role, tenantId]
  );
  const user = userResult.rows[0];

  // 4. Seed industry data for this tenant
  await seedDemoIndustry(tenantId, industry, user.id);

  return { tenantId, userId: user.id, email: user.email, role: user.role };
}

/**
 * Delete a demo tenant and ALL its data (cascade).
 * Called by: reset-demo-data API, or can be called directly.
 */
export async function deleteDemoTenant(tenantId: string): Promise<void> {
  // Verify it's actually a demo tenant before deleting (safety check)
  const check = await db.query(
    `SELECT id FROM tenants WHERE id = $1 AND is_demo = true`,
    [tenantId]
  );
  if (check.rowCount === 0) {
    throw new Error('Not a demo tenant or tenant not found');
  }
  // CASCADE deletes: users → audit_log, deals, contacts, notes, activities, etc.
  await db.query(`DELETE FROM tenants WHERE id = $1`, [tenantId]);
}

/**
 * Seed demo data for a specific tenant.
 */
async function seedDemoIndustry(tenantId: string, industry: IndustryId, ownerId: string) {
  const seedPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
  });
  try {
    const { runSeed } = require('../../scripts/seeds/_base');
    const industryModule = require(`../../scripts/seeds/seed-${industry}`);
    await runSeed(industryModule, tenantId, ownerId);
  } finally {
    await seedPool.end().catch(() => {});
  }
}
