import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import RequireModule from '@/components/providers/RequireModule';
import { getContract } from '@/modules/biz-ops/engine/contracts';
import { listCampaigns } from '@/modules/biz-ops/engine/campaigns';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { BizOpsContract } from '@/components/plugins/biz-ops/BizOpsContract';

export default async function ContractDetailPage({ params }: { params: { id: string } }) {
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

  const [contract, allCampaigns] = await Promise.all([
    getContract(tenantId, params.id),
    listCampaigns(tenantId)
  ]);
  
  if (!contract) return notFound();

  const contractCampaigns = allCampaigns.filter(c => c.contract_id === params.id).map(c => ({
    ...c,
    start_date: c.start_date?.toISOString() ?? null,
    end_date: c.end_date?.toISOString() ?? null,
    deleted_at: null,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
  }));

  // Pass contract data down
  return (
    <RequireModule moduleId="biz-ops">
      <BizOpsContract initialContract={contract} campaigns={contractCampaigns as any} />
    </RequireModule>
  );
}
