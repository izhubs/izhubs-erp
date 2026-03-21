import { getTenantModules } from '@/core/engine/modules';
import { AppStore } from '@/modules/registry/components/AppStore';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export const metadata = {
  title: 'Plugins — izhubs ERP',
  description: 'Quản lý và cài đặt các plugins mở rộng cho izhubs ERP',
};

/**
 * Server Component — fetch plugins server-side for fast initial render.
 * AppStore is a Client Component that handles interactive install/uninstall.
 */
export default async function PluginsPage() {
  const plugins = await getTenantModules(DEFAULT_TENANT_ID);

  // Serialize dates to strings for client component
  const serialized = plugins.map(p => ({
    ...p,
    createdAt: undefined,
    installedAt: p.installedAt ? p.installedAt.toISOString() : null,
  }));

  return <AppStore initialPlugins={serialized as any} />;
}
