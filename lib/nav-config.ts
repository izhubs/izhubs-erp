// =============================================================
// izhubs ERP — Nav Config Fetcher
// Server-side only. Fetches the navigation config for a tenant
// from the `industry_templates` table, applies UI role filtering,
// and returns a typed NavConfig.
//
// Wrapped with Next.js unstable_cache tagged by tenantId so Server
// Components skip the DB round-trip on every render.
//
// Cache bust: call revalidateTag('nav-config-{tenantId}') from the
// settings API whenever the tenant saves a new industry/theme.
// This ensures instant UI updates — no TTL wait.
// =============================================================

import { unstable_cache } from 'next/cache';
import { db } from '@/core/engine/db';
import type { NavConfig, NavItem } from '@/templates/engine/template.schema';

/**
 * All roles in ascending privilege order.
 * A user with role 'admin' can see items that require 'member' or 'viewer'.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  viewer:     1,
  member:     2,
  admin:      3,
  superadmin: 4,
};

/** Filter nav items the current user role is permitted to see (UI-only). */
function filterByRole(items: NavItem[], userRole: string): NavItem[] {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;

  return items.reduce<NavItem[]>((acc, item) => {
    const requiredLevel = Math.min(...item.roles.map((r) => ROLE_HIERARCHY[r] ?? 99));
    if (userLevel >= requiredLevel) {
      acc.push({
        ...item,
        children: item.children ? filterByRole(item.children, userRole) : undefined,
      });
    }
    return acc;
  }, []);
}

/** Raw fetch from DB — not cached (used inside unstable_cache wrapper). */
async function fetchNavConfigFromDB(tenantId: string): Promise<NavConfig | null> {
  const result = await db.query(
    `SELECT it.nav_config
     FROM tenants t
     JOIN industry_templates it ON it.id = t.industry
     WHERE t.id = $1 AND t.active = true`,
    [tenantId]
  );

  if (result.rows.length === 0) return null;
  // JSONB is already parsed by the pg driver
  return result.rows[0].nav_config as NavConfig;
}

/**
 * Get the NavConfig for a tenant, filtered by the user's role.
 * Result is cached per-tenant — invalidate on theme/industry save.
 *
 * @param tenantId - UUID of the tenant
 * @param userRole - role of the current user ('admin' | 'member' | 'viewer')
 * @returns Filtered NavConfig or null if tenant has no industry set
 */
export async function getNavConfig(
  tenantId: string,
  userRole: string
): Promise<NavConfig | null> {
  // Cache the raw config (not role-filtered) so all roles share the same cache entry
  const getCachedConfig = unstable_cache(
    () => fetchNavConfigFromDB(tenantId),
    [`nav-config-${tenantId}`],
    {
      tags: [`nav-config-${tenantId}`],
      // No revalidate — cache lives until explicitly busted via revalidateTag()
    }
  );

  const config = await getCachedConfig();
  if (!config) return null;

  // Apply role filter at call time (not cached, fast in-memory)
  return {
    ...config,
    sidebar: filterByRole(config.sidebar, userRole),
    bottomItems: config.bottomItems
      ? filterByRole(config.bottomItems, userRole)
      : undefined,
    dashboardLayout: {
      rows: config.dashboardLayout.rows.filter((row) => {
        if (!row.minRole) return true;
        const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
        const minLevel = ROLE_HIERARCHY[row.minRole] ?? 0;
        return userLevel >= minLevel;
      }),
    },
  };
}
