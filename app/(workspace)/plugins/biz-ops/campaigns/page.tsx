import { db } from '@/core/engine/db';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { redirect } from 'next/navigation';
import CampaignsKanbanBoard from '@/components/plugins/biz-ops/CampaignsKanbanBoard';
import { IzButton } from '@/components/ui/IzButton';
import { Settings, FileDown } from 'lucide-react';
import type { Campaign } from '@/modules/biz-ops/engine/campaigns';

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

  const initialCampaigns = rows as Campaign[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-header" style={{ flexShrink: 0, padding: '16px 24px 12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>Biz-Ops Projects</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
            Quản trị tiến độ và chi phí các Chiến dịch & Dự án
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <IzButton variant="outline" style={{ padding: '0 12px' }}>
            <FileDown size={16} style={{ marginRight: 8 }} />
            Export Data
          </IzButton>
          <IzButton variant="outline" size="icon" title="Cài đặt Module">
            <Settings size={16} />
          </IzButton>
          <IzButton variant="default">+ New Project</IzButton>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <CampaignsKanbanBoard initialCampaigns={initialCampaigns} />
      </div>
    </div>
  );
}
