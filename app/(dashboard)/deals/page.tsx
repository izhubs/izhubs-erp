import { listDeals } from '@/core/engine/deals';
import KanbanBoard from '@/components/deals/KanbanBoard';

export const metadata = { title: 'Pipeline — izhubs ERP' };

export default async function DealsPage() {
  const { data: deals } = await listDeals({ limit: 500 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1>Pipeline</h1>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <KanbanBoard initialDeals={deals} />
      </div>
    </div>
  );
}
