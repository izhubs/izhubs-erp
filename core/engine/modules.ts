import { z } from 'zod';
import { db } from './db';
import { revalidateTag } from 'next/cache';

// =============================================================
// izhubs ERP — Module Registry Engine
// SOURCE OF TRUTH for module activation and status checks.
// Only this file may query the `modules` and `tenant_modules` tables.
// =============================================================

// ---- Zod Schemas (enforce DB output shape at runtime) ----

export const ModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  version: z.string(),
  category: z.enum(['core', 'finance', 'operations', 'communication']),
  icon: z.string().nullable(),
  isOfficial: z.boolean(),
  configSchema: z.record(z.unknown()).default({}),
  createdAt: z.coerce.date(),
});

export const TenantModuleSchema = z.object({
  tenantId: z.string().uuid(),
  moduleId: z.string(),
  isActive: z.boolean(),
  config: z.record(z.unknown()).default({}),
  installedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
});

export const ModuleWithStatusSchema = ModuleSchema.extend({
  isActive: z.boolean(),
  installedAt: z.coerce.date().nullable(),
  config: z.record(z.unknown()).default({}),
});

export type Module = z.infer<typeof ModuleSchema>;
export type TenantModule = z.infer<typeof TenantModuleSchema>;
export type ModuleWithStatus = z.infer<typeof ModuleWithStatusSchema>;

// ---- In-memory cache for isModuleActive ----
// Prevents a DB round-trip on every API request.
// TTL: 60 seconds — acceptable lag for toggle activation UX.

interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

const moduleActiveCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000; // 60 seconds

function cacheKey(tenantId: string, moduleId: string): string {
  return `${tenantId}:${moduleId}`;
}

function getCached(tenantId: string, moduleId: string): boolean | null {
  const entry = moduleActiveCache.get(cacheKey(tenantId, moduleId));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    moduleActiveCache.delete(cacheKey(tenantId, moduleId));
    return null;
  }
  return entry.value;
}

function setCache(tenantId: string, moduleId: string, value: boolean): void {
  moduleActiveCache.set(cacheKey(tenantId, moduleId), {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function invalidateCache(tenantId: string, moduleId: string): void {
  moduleActiveCache.delete(cacheKey(tenantId, moduleId));
}

// ---- Public Engine Functions ----

/**
 * Get all modules available in the catalog.
 */
export async function getAvailableModules(): Promise<Module[]> {
  const result = await db.query(
    `SELECT
      id, name, description, version, category, icon,
      is_official AS "isOfficial",
      config_schema AS "configSchema",
      created_at AS "createdAt"
    FROM modules
    ORDER BY category, name`
  );
  return result.rows.map(row => ModuleSchema.parse(row));
}

/**
 * Get all modules for a tenant with their activation status.
 * Includes modules not yet installed (is_active = false).
 */
export async function getTenantModules(tenantId: string): Promise<ModuleWithStatus[]> {
  const result = await db.query(
    `SELECT
      m.id, m.name, m.description, m.version, m.category, m.icon,
      m.is_official AS "isOfficial",
      m.config_schema AS "configSchema",
      m.created_at AS "createdAt",
      COALESCE(tm.is_active, false) AS "isActive",
      tm.installed_at AS "installedAt",
      COALESCE(tm.config, '{}') AS "config"
    FROM modules m
    LEFT JOIN tenant_modules tm
      ON tm.module_id = m.id AND tm.tenant_id = $1
    ORDER BY m.category, m.name`,
    [tenantId]
  );
  return result.rows.map(row => ModuleWithStatusSchema.parse(row));
}

/**
 * Check if a specific module is active for a tenant.
 * Results are cached for 60 seconds to minimize DB queries on every API request.
 */
export async function isModuleActive(tenantId: string, moduleId: string): Promise<boolean> {
  // Check cache first
  const cached = getCached(tenantId, moduleId);
  if (cached !== null) return cached;

  const result = await db.query(
    `SELECT is_active FROM tenant_modules
     WHERE tenant_id = $1 AND module_id = $2`,
    [tenantId, moduleId]
  );

  const active = result.rows[0]?.is_active ?? false;
  setCache(tenantId, moduleId, active);
  return active;
}

/**
 * Check if a module is active AND accessible by the given user role.
 * Parses the `allowedRoles` array from the `config` JSONB column.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  superadmin: 4,
};

export async function checkModuleAccess(tenantId: string, moduleId: string, role: string): Promise<boolean> {
  const result = await db.query(
    `SELECT is_active, config FROM tenant_modules
     WHERE tenant_id = $1 AND module_id = $2`,
    [tenantId, moduleId]
  );
  if (result.rows.length === 0) return false;
  
  if (!result.rows[0].is_active) return false;

  const config = result.rows[0].config || {};
  const allowedRoles = Array.isArray(config.allowedRoles) && config.allowedRoles.length > 0 
    ? config.allowedRoles 
    : ['admin', 'member'];
  
  const userLevel = ROLE_HIERARCHY[role] ?? 0;
  const requireLevel = Math.min(...allowedRoles.map((r: string) => ROLE_HIERARCHY[r] ?? 99));

  return userLevel >= requireLevel;
}

/**
 * Activate a module for a tenant.
 * Uses UPSERT to handle both first-install and re-activation.
 */
export async function activateModule(tenantId: string, moduleId: string): Promise<void> {
  // Verify module exists
  const moduleExists = await db.query(
    'SELECT id FROM modules WHERE id = $1',
    [moduleId]
  );
  if (moduleExists.rows.length === 0) {
    throw new Error(`Module '${moduleId}' not found in registry`);
  }

  const existingRes = await db.query(
    'SELECT config FROM tenant_modules WHERE tenant_id = $1 AND module_id = $2',
    [tenantId, moduleId]
  );
  const config = existingRes.rows[0]?.config || {};
  if (!config.allowedRoles) {
    config.allowedRoles = ['admin', 'member'];
  }

  await db.query(
    `INSERT INTO tenant_modules (tenant_id, module_id, is_active, installed_at, updated_at, config)
     VALUES ($1, $2, true, NOW(), NOW(), $3)
     ON CONFLICT (tenant_id, module_id)
     DO UPDATE SET is_active = true, installed_at = COALESCE(tenant_modules.installed_at, NOW()), updated_at = NOW(), config = $3`,
    [tenantId, moduleId, config]
  );

  // Invalidate cache immediately so next request gets fresh state
  invalidateCache(tenantId, moduleId);
  revalidateTag(`nav-config-${tenantId}`);
}

/**
 * Deactivate a module for a tenant.
 * Does NOT delete data — tenant data survives deactivation.
 */
export async function deactivateModule(tenantId: string, moduleId: string): Promise<void> {
  // Prevent deactivating core CRM module (required for basic operation)
  if (moduleId === 'crm') {
    throw new Error("Cannot deactivate the 'crm' module — it is required for core operation");
  }

  await db.query(
    `UPDATE tenant_modules
     SET is_active = false, updated_at = NOW()
     WHERE tenant_id = $1 AND module_id = $2`,
    [tenantId, moduleId]
  );

  invalidateCache(tenantId, moduleId);
  revalidateTag(`nav-config-${tenantId}`);
}
