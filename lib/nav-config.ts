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
    `SELECT it.nav_config, it.theme_defaults
     FROM tenants t
     JOIN industry_templates it ON it.id = t.industry
     WHERE t.id = $1 AND t.active = true`,
    [tenantId]
  );

  if (result.rows.length === 0) return null;
  // JSONB is already parsed by the pg driver
  const navConfig = result.rows[0].nav_config as NavConfig;
  const themeDefaults = result.rows[0].theme_defaults as Record<string, string> | null;

  // Fetch active non-core plugins and inject into sidebar
  const activePlugins = await db.query(
    `SELECT m.id, m.name, m.icon, tm.config
     FROM modules m
     JOIN tenant_modules tm ON tm.module_id = m.id AND tm.tenant_id = $1
     WHERE tm.is_active = true AND m.category != 'core'`,
    [tenantId]
  );

  const pluginNavItems: NavItem[] = activePlugins.rows.map(m => {
    const allowedRoles = Array.isArray(m.config?.allowedRoles)
      ? m.config.allowedRoles
      : ['admin', 'member'];

    let label = m.name.split('—')[0].trim();
    let icon = m.icon || 'Package';

    // UI-friendly overrides for known plugins
    if (m.id === 'izform') {
      label = 'Forms';
      icon = 'ClipboardList'; // Must be a valid Lucide React icon name
    }

    return {
      id: `plugin-${m.id}`,
      label,
      href: `/plugins/${m.id}`,
      icon,
      roles: allowedRoles,
    };
  });

  const sidebar = [...(navConfig.sidebar ?? []), ...pluginNavItems];

  // Merge theme_defaults (stored as separate column) into the NavConfig
  return { ...navConfig, sidebar, themeDefaults: themeDefaults ?? {} };
}

export const DEFAULT_BOTTOM_ITEMS: NavItem[] = [
  { id: 'plugins',  label: 'Plugins',  href: '/settings/plugins', icon: 'Package',  roles: ['admin'] },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'Settings', roles: ['admin'] },
];

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
): Promise<(NavConfig & { bottomItems: NavItem[] }) | null> {
  // Cache the raw config (not role-filtered) so all roles share the same cache entry
  const getCachedConfig = unstable_cache(
    () => fetchNavConfigFromDB(tenantId),
    [`nav-config-v2-${tenantId}`],
    {
      tags: [`nav-config-${tenantId}`],
    }
  );

  const config = await getCachedConfig();
  if (!config) return null;

  // Apply role filter at call time (not cached, fast in-memory)
  // bottomItems are always system defaults, completely ignoring DB template overrides
  return {
    ...config,
    sidebar: filterByRole(config.sidebar ?? [], userRole),
    bottomItems: filterByRole(DEFAULT_BOTTOM_ITEMS, userRole),
    dashboardLayout: {
      rows: (config.dashboardLayout?.rows ?? []).filter((row) => {
        if (!row.minRole) return true;
        const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
        const minLevel = ROLE_HIERARCHY[row.minRole] ?? 0;
        return userLevel >= minLevel;
      }),
    },
  };
}
