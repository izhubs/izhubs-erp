import { getContract } from '@izerp-plugin/modules/biz-ops/engine/contracts';
import { listCampaignsByContract } from '@izerp-plugin/modules/biz-ops/engine/campaigns';
import { BizOpsContract } from '@izerp-plugin/components/plugins/biz-ops/BizOpsContract';
import RequireModule from '@/components/providers/RequireModule';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { redirect, notFound } from 'next/navigation';

export const metadata = {
  title: 'Contract Details — izhubs ERP',
};

export default async function ContractPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

  const contract = await getContract(tenantId, params.id);
  if (!contract) {
    return notFound();
  }

  // Load associated campaigns/projects
  const campaigns = await listCampaignsByContract(tenantId, contract.id);

  const serializedContract = {
    ...contract,
    start_date: contract.start_date?.toISOString() ?? null,
    end_date: contract.end_date?.toISOString() ?? null,
    deleted_at: null,
    created_at: contract.created_at.toISOString(),
    updated_at: contract.updated_at.toISOString(),
  };

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
      <BizOpsContract
        initialContract={serializedContract}
        campaigns={serializedCampaigns}
      />
    </RequireModule>
  );
}
