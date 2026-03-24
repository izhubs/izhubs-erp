import { getCampaign } from '@izerp-plugin/modules/biz-ops/engine/campaigns';
import { BizOpsCampaign } from '@izerp-plugin/components/plugins/biz-ops/BizOpsCampaign';
import RequireModule from '@/components/providers/RequireModule';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { redirect, notFound } from 'next/navigation';

export const metadata = {
  title: 'Project Details — izhubs ERP',
};

export default async function CampaignPage(props: { params: Promise<{ id: string }> }) {
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

  const campaign = await getCampaign(tenantId, params.id);
  if (!campaign) {
    return notFound();
  }

  const serializedCampaign = {
    ...campaign,
    start_date: campaign.start_date?.toISOString() ?? null,
    end_date: campaign.end_date?.toISOString() ?? null,
    deleted_at: null,
    created_at: campaign.created_at.toISOString(),
    updated_at: campaign.updated_at.toISOString(),
  };

  return (
    <RequireModule moduleId="biz-ops">
      <BizOpsCampaign
        campaign={serializedCampaign as any}
      />
    </RequireModule>
  );
}
