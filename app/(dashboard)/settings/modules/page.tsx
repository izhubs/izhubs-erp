import { getTenantModules } from '@/core/engine/modules';
import { AppStore } from '@/modules/registry/components/AppStore';
import { getTenantId } from '@/core/engine/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Plugins — izhubs ERP',
  description: 'Quản lý và cài đặt các plugins mở rộng cho izhubs ERP',
};

/**
 * Server Component — fetch plugins server-side for fast initial render.
 * AppStore is a Client Component that handles interactive install/uninstall.
 */
export default async function PluginsPage() {
  const tenantId = await getTenantId();
  const plugins = await getTenantModules(tenantId);

  // Serialize dates to strings for client component
  const serialized = plugins.map(p => ({
    ...p,
    createdAt: undefined,
    installedAt: p.installedAt ? p.installedAt.toISOString() : null,
  }));

  return <AppStore initialPlugins={serialized as any} />;
}
