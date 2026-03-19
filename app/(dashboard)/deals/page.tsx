// =============================================================
// izhubs ERP — /deals page (Pipeline)
// Server Component: fetch deals + pipeline stages from template → pass to PipelineViews.
// =============================================================

import { listDeals } from '@/modules/crm/engine/deals';
import PipelineViews from '@/components/deals/PipelineViews';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { db } from '@/core/engine/db';
import type { PipelineStageConfig } from '@/core/config/pipeline';
import { VIRTUAL_OFFICE_STAGES } from '@/core/config/pipeline';

export const metadata = { title: 'Pipeline — izhubs ERP' };
export const dynamic = 'force-dynamic';

async function getTemplateStages(tenantId: string): Promise<PipelineStageConfig[]> {
  try {
    const res = await db.query(
      `SELECT it.nav_config
       FROM tenants t
       JOIN industry_templates it ON it.id = t.industry
       WHERE t.id = $1 AND t.active = true`,
      [tenantId]
    );
    const pipelineStages = res.rows[0]?.nav_config?.pipelineStages;
    if (Array.isArray(pipelineStages) && pipelineStages.length > 0) {
      return pipelineStages.map((s: { key: string; label: string; color?: string; closed?: boolean }) => ({
        id: s.key as PipelineStageConfig['id'],
        label: s.label,
        color: s.color ?? '#94a3b8',
        closed: s.closed ?? false,
      }));
    }
  } catch { /* fallback */ }
  return VIRTUAL_OFFICE_STAGES;
}

export default async function DealsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hz_access')?.value;

  let stages: PipelineStageConfig[] = VIRTUAL_OFFICE_STAGES;

  if (token) {
    try {
      const claims = await verifyJwt(token);
      const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
      stages = await getTemplateStages(tenantId);
    } catch { /* fallback to default */ }
  }

  const { data: deals } = await listDeals({ limit: 500 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 'calc(var(--space-5) * -1)' }}>
      <PipelineViews initialDeals={deals} stages={stages} />
    </div>
  );
}
