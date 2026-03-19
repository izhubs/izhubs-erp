// =============================================================
// izhubs ERP — /deals page (Pipeline)
// Server Component: fetch all deals → pass to PipelineViews.
// PipelineViews supports Kanban / Table / Funnel views.
// =============================================================

import { listDeals } from '@/modules/crm/engine/deals';
import PipelineViews from '@/components/deals/PipelineViews';

export const metadata = { title: 'Pipeline — izhubs ERP' };

export default async function DealsPage() {
  const { data: deals } = await listDeals({ limit: 500 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 'calc(var(--space-5) * -1)' }}>
      <PipelineViews initialDeals={deals} />
    </div>
  );
}
