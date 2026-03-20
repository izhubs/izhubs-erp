import AppLayout from '@/components/ui/AppLayout';
import { getNavConfig } from '@/lib/nav-config';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { db } from '@/core/engine/db';
import type { NavItem } from '@/templates/engine/template.schema';
import { TourProvider } from '@/components/onboarding/TourContext';


export const dynamic = 'force-dynamic';

// Default fallback nav — displayed when tenant has no industry set yet.
// Mirrors the old hardcoded NAV_ITEMS so existing tenants see no regression.
// Only show nav items that have real pages — hide stubs until features are built.
// Stub pages (contracts, automation, reports, audit-log) will be re-added when ready.
const DEFAULT_NAV: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  href: '/dashboard',  icon: 'LayoutDashboard', roles: ['admin', 'member', 'viewer'] },
  { id: 'contacts',   label: 'Contacts',   href: '/contacts',   icon: 'Users',           roles: ['admin', 'member'] },
  { id: 'deals',      label: 'Deals',      href: '/deals',      icon: 'Briefcase',       roles: ['admin', 'member'] },
  { id: 'import',     label: 'Import',     href: '/import',     icon: 'Upload',          roles: ['admin', 'member'] },
];

const DEFAULT_BOTTOM: NavItem[] = [
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'Settings', roles: ['admin'] },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Read access token from cookie (set by /api/v1/auth/login)
  const cookieStore = await cookies();
  const token = cookieStore.get('hz_access')?.value;

  let navItems: NavItem[] = DEFAULT_NAV;
  let bottomItems: NavItem[] = DEFAULT_BOTTOM;
  let themeDefaults: Record<string, string> = {};

  if (token) {
    try {
      const claims = await verifyJwt(token);
      const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
      const role = claims.role ?? 'member';

      const [navConfig, themeRes] = await Promise.all([
        getNavConfig(tenantId, role),
        db.query(
          `SELECT it.theme_defaults
           FROM tenants t
           JOIN industry_templates it ON it.id = t.industry
           WHERE t.id = $1 AND t.active = true`,
          [tenantId]
        ),
      ]);

      if (navConfig) {
        navItems = navConfig.sidebar;
        bottomItems = navConfig.bottomItems ?? DEFAULT_BOTTOM;
      }
      if (themeRes.rows[0]?.theme_defaults) {
        themeDefaults = themeRes.rows[0].theme_defaults as Record<string, string>;
      }
    } catch {
      // Token invalid or expired — fallback to default nav,
      // middleware will redirect to /login on next navigation.
    }
  }

  return (
    <TourProvider>
      <AppLayout navItems={navItems} bottomItems={bottomItems} themeDefaults={themeDefaults}>
        {children}
      </AppLayout>
    </TourProvider>
  );
}
