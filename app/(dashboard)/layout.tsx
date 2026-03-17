// Server Component — fetches NavConfig from DB and passes to the client AppLayout.
// This is where the "dumb component" data feed gets wired in.
// `dynamic = 'force-dynamic'` stays here so every request re-evaluates auth.

import AppLayout from '@/components/ui/AppLayout';
import { getNavConfig } from '@/lib/nav-config';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import type { NavItem } from '@/templates/engine/template.schema';

export const dynamic = 'force-dynamic';

// Default fallback nav — displayed when tenant has no industry set yet.
// Mirrors the old hardcoded NAV_ITEMS so existing tenants see no regression.
const DEFAULT_NAV: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  href: '/dashboard',  icon: 'LayoutDashboard', roles: ['admin', 'member', 'viewer'] },
  { id: 'contacts',   label: 'Contacts',   href: '/contacts',   icon: 'Users',           roles: ['admin', 'member'] },
  { id: 'deals',      label: 'Deals',      href: '/deals',      icon: 'Briefcase',       roles: ['admin', 'member'] },
  { id: 'import',     label: 'Import',     href: '/import',     icon: 'Upload',          roles: ['admin', 'member'] },
  { id: 'contracts',  label: 'Contracts',  href: '/contracts',  icon: 'FileText',        roles: ['admin', 'member'] },
  { id: 'automation', label: 'Automation', href: '/automation', icon: 'Zap',             roles: ['admin'] },
  { id: 'reports',    label: 'Reports',    href: '/reports',    icon: 'BarChart2',       roles: ['admin'] },
  { id: 'audit-log',  label: 'Audit Log',  href: '/audit-log',  icon: 'Activity',        roles: ['admin'] },
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

  if (token) {
    try {
      const claims = await verifyJwt(token);
      const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
      const role = claims.role ?? 'member';

      const navConfig = await getNavConfig(tenantId, role);
      if (navConfig) {
        navItems = navConfig.sidebar;
        bottomItems = navConfig.bottomItems ?? DEFAULT_BOTTOM;
      }
    } catch {
      // Token invalid or expired — fallback to default nav,
      // middleware will redirect to /login on next navigation.
    }
  }

  return (
    <AppLayout navItems={navItems} bottomItems={bottomItems}>
      {children}
    </AppLayout>
  );
}
