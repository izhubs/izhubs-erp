import { listContracts } from '@izerp-plugin/modules/biz-ops/engine/contracts';
import { listCampaigns } from '@izerp-plugin/modules/biz-ops/engine/campaigns';
import { BizOpsProjectsClient } from '@izerp-plugin/components/plugins/biz-ops/BizOpsProjects';
import RequireModule from '@/components/providers/RequireModule';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Projects — izhubs ERP',
  description: 'Manage contracts, milestones, and project campaigns',
};

export default async function BizOpsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hz_access')?.value;
  if (!token) return redirect('/login');

  let tenantId = '';
  try {
    const claims = await verifyJwt(token);
    if (!claims.tenantId) throw new Error('No tenantId claim');
    tenantId = claims.tenantId;
  } catch {
    return redirect('/login');
  }

  const [contracts, campaigns] = await Promise.all([
    listContracts(tenantId),
    listCampaigns(tenantId),
  ]);

  const serializedContracts = contracts.map(c => ({
    ...c,
    start_date: c.start_date?.toISOString() ?? null,
    end_date: c.end_date?.toISOString() ?? null,
    deleted_at: null,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  }));

  const serializedCampaigns = campaigns.map(c => ({
    ...c,
    start_date: c.start_date?.toISOString() ?? null,
    end_date: c.end_date?.toISOString() ?? null,
    deleted_at: null,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  }));

  return (
    <RequireModule moduleId="biz-ops">
      <BizOpsProjectsClient
        initialContracts={serializedContracts as any}
        initialCampaigns={serializedCampaigns as any}
      />
    </RequireModule>
  );
}
