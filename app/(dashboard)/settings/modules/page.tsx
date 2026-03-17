import { getTenantModules } from '@/core/engine/modules';
import { AppStore } from '@/modules/registry/components/AppStore';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export const metadata = {
  title: 'Modules — izhubs ERP',
  description: 'Quản lý và cài đặt các modules mở rộng cho izhubs ERP',
};

/**
 * Server Component — fetch modules server-side for fast initial render.
 * AppStore is a Client Component that handles interactive install/uninstall.
 */
export default async function ModulesPage() {
  const modules = await getTenantModules(DEFAULT_TENANT_ID);

  // Serialize dates to strings for client component
  const serialized = modules.map(m => ({
    ...m,
    createdAt: undefined,
    installedAt: m.installedAt ? m.installedAt.toISOString() : null,
  }));

  return <AppStore initialModules={serialized as any} />;
}
