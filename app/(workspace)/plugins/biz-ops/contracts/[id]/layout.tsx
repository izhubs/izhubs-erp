import AppLayout from '@/components/ui/AppLayout';
import type { NavItem } from '@/templates/engine/template.schema';
import { db } from '@/core/engine/db';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';

export default async function ContractLayout({ children, params }: { children: React.ReactNode, params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('hz_access')?.value;
  let themeDefaults: Record<string, string> = {};

  if (token) {
    try {
      const claims = await verifyJwt(token);
      const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
      const themeRes = await db.query(
        `SELECT it.theme_defaults
         FROM tenants t
         JOIN industry_templates it ON it.id = t.industry
         WHERE t.id = $1 AND t.active = true`,
        [tenantId]
      );
      if (themeRes.rows[0]?.theme_defaults) {
        themeDefaults = themeRes.rows[0].theme_defaults as Record<string, string>;
      }
    } catch {}
  }

  const navItems: NavItem[] = [
    { id: 'back', label: '← Back to ERP', href: '/plugins/biz-ops', icon: 'ArrowLeft', roles: ['admin', 'member'] },
    { id: 'overview', label: 'Overview', href: `/plugins/biz-ops/contracts/${params.id}`, icon: 'LayoutDashboard', roles: ['admin', 'member'] },
  ];

  return <AppLayout navItems={navItems} themeDefaults={themeDefaults}>{children}</AppLayout>;
}
