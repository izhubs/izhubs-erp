import { db } from '@/core/engine/db';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { redirect } from 'next/navigation';
import CampaignsClientWrapper from './CampaignsClientWrapper';
import type { Campaign } from '@izerp-plugin/modules/biz-ops/engine/campaigns';

export default async function CampaignsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hz_access')?.value;
  if (!token) redirect('/login');
  
  let tenantId = '00000000-0000-0000-0000-000000000001';
  try {
    const claims = await verifyJwt(token);
    if (claims.tenantId) tenantId = claims.tenantId;
  } catch {
    redirect('/login');
  }

  // Fetch campaigns initially (Server-side rendering)
  // In a real app we might fetch Members alongside it to populate the avatars, 
  // but for now we'll do exactly like the Deals pipeline 
  // (where members are joined or loaded). Let's fetch directly using engine for SSR.
  const { rows } = await db.query(
    `SELECT c.*, 
            COALESCE(
              json_agg(
                json_build_object(
                  'user_name', u.name,
                  'user_avatar_url', u.avatar_url
                )
              ) FILTER (WHERE u.id IS NOT NULL), 
              '[]'
            ) as members
     FROM campaigns c
     LEFT JOIN project_members pm ON c.id = pm.campaign_id
     LEFT JOIN users u ON pm.user_id = u.id
     WHERE c.tenant_id = $1 AND c.deleted_at IS NULL
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
     [tenantId]
  );

  const { rows: contractRows } = await db.query(
    `SELECT id, name as title FROM contracts WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
    [tenantId]
  );
  const contracts = contractRows;

  const initialCampaigns = rows as Campaign[];

  return <CampaignsClientWrapper initialCampaigns={initialCampaigns} contracts={contracts} />;
}
