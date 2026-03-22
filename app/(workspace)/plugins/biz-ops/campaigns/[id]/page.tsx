import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import RequireModule from '@/components/providers/RequireModule';
import { getCampaign } from '@/modules/biz-ops/engine/campaigns';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { BizOpsCampaign } from '@/components/plugins/biz-ops/BizOpsCampaign';

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
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

  // Validate the campaign exists and belongs to the tenant
  const campaign = await getCampaign(tenantId, params.id);
  if (!campaign) return notFound();

  // We pass the campaign data down. Client component will fetch Tasks/Files/Members.
  return (
    <RequireModule moduleId="biz-ops">
      <BizOpsCampaign campaign={campaign} />
    </RequireModule>
  );
}
