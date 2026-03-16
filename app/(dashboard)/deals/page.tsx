import { listDeals } from '@/core/engine/deals';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export const metadata = { title: 'Pipeline — izhubs ERP' };

export default async function DealsPage() {
  // Server Component: fetch data trực tiếp từ engine (không qua HTTP)
  // Rule: Server Components trong dashboard được phép gọi engine functions
  const { data: deals } = await listDeals({ limit: 200 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1>Pipeline</h1>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <KanbanBoard initialDeals={deals} />
      </div>
    </div>
  );
}
