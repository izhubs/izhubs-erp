'use client';

// =============================================================
// izhubs ERP — Pipeline View Switcher
// 3 views: Kanban (default) | Table | Funnel
// Persists selected view in localStorage.
// =============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReactTable, getCoreRowModel, getSortedRowModel, createColumnHelper, SortingState } from '@tanstack/react-table';
import type { Deal, DealStage } from '@/core/schema/entities';
import { PIPELINE_STAGES, type PipelineStageConfig } from '@/core/config/pipeline';
import { IzTable } from '@/components/ui/IzTable';
import { IzBadge, IzBadgeVariant } from '@/components/ui/IzBadge';
import { IzButton } from '@/components/ui/IzButton';
import { apiFetch } from '@/lib/apiFetch';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { formatDate } from '@/lib/userTime';
import { formatDate } from '@/lib/userTime';

// Kanban is already complex — keep lazy
const KanbanBoard = dynamic(() => import('./KanbanBoard'), { ssr: false });

type ViewMode = 'kanban' | 'table' | 'funnel';

const VIEW_ICONS: Record<ViewMode, string> = {
  kanban: '⬛',
  table:  '☰',
  funnel: '▽',
};
const VIEW_LABELS: Record<ViewMode, string> = {
  kanban: 'Kanban',
  table:  'Danh sách',
  funnel: 'Phễu',
};

// ---- Table View ------------------------------------------------
function TableView({ deals, onDealClick, stages }: { deals: Deal[]; onDealClick: (d: Deal) => void; stages: PipelineStageConfig[] }) {
  const { fmtCompact } = useCurrency();
  const [sorting, setSorting] = useState<SortingState>([]);
  const stageMap = useMemo(() => Object.fromEntries(stages.map(s => [s.id, s])), [stages]);

  const STAGE_VARIANT: Record<string, IzBadgeVariant> = {
    won: 'success', lost: 'destructive', active: 'success',
    renewal: 'warning', lead: 'secondary', proposal: 'default',
  };

  const columnHelper = createColumnHelper<Deal>();
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Tên deal',
      cell: info => <span style={{ fontWeight: 500 }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('stage', {
      header: 'Stage',
      cell: info => {
        const val = info.getValue();
        return (
          <IzBadge variant={STAGE_VARIANT[val] ?? 'secondary'} dot>
            {stageMap[val]?.label ?? val}
          </IzBadge>
        );
      }
    }),
    columnHelper.accessor('value', {
      header: 'Giá trị',
      cell: info => <span style={{ fontWeight: 600 }}>{fmtCompact(info.getValue())}</span>,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Ngày tạo',
      cell: info => <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
        {formatDate(info.getValue() ?? '')}
      </span>,
    }),
  ], [stageMap, fmtCompact]);

  const table = useReactTable({
    data: deals,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div style={{ background: 'var(--color-bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
      <IzTable 
        table={table} 
        isEmpty={deals.length === 0}
        onRowClick={onDealClick}
        emptyProps={{ title: 'Không có deals nào', description: 'Chưa có dữ liệu nào trong bảng này.' }}
      />
    </div>
  );
}

// ---- Funnel View -----------------------------------------------
function FunnelView({ deals, stages }: { deals: Deal[]; stages: PipelineStageConfig[] }) {
  const { fmtCompact } = useCurrency();
  const openDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const openStages = stages.filter(s => !s.closed);
  const totalStages = openStages.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: 640, margin: '0 auto' }}>
      {openStages.map((stage, idx) => {
        const stageDeals = openDeals.filter(d => d.stage === stage.id);
        const count = stageDeals.length;
        const value = stageDeals.reduce((s, d) => s + d.value, 0);
        // Funnel shape: top stage = 100%, each step narrows by equal amount
        const pct = Math.max(25, 100 - (idx / Math.max(1, totalStages - 1)) * 60);

        return (
          <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: `${pct}%`, minWidth: 200, transition: 'width 0.4s ease' }}>
              <div style={{
                background: stage.color ?? 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: count === 0 ? 0.35 : 1,
              }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                  {stage.label}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'var(--font-size-xs)', textAlign: 'right' }}>
                  {count} deals{value > 0 ? ` · ${fmtCompact(value)}` : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="card" style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-6)' }}>
        <Stat label="Tổng pipeline" value={fmtCompact(openDeals.reduce((s, d) => s + d.value, 0))} />
        <Stat label="Won" value={fmtCompact(deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0))} green />
        <Stat label="Deals đang open" value={String(openDeals.length)} />
      </div>
    </div>
  );
}

function Stat({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: green ? 'var(--color-success)' : 'var(--color-text)' }}>{value}</div>
    </div>
  );
}

// ---- Main PipelineViews component ------------------------------
export default function PipelineViews({ initialDeals, stages: stagesProp }: { initialDeals: Deal[]; stages?: PipelineStageConfig[] }) {
  const { fmtCompact } = useCurrency();
  const stages = stagesProp ?? PIPELINE_STAGES;
  const router = useRouter();
  const [view, setView] = useState<ViewMode>('kanban');
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [totalValue, setTotalValue] = useState(0);

  // Persist view preference
  useEffect(() => {
    const saved = localStorage.getItem('hz_pipeline_view') as ViewMode | null;
    if (saved && ['kanban', 'table', 'funnel'].includes(saved)) setView(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('hz_pipeline_view', view);
  }, [view]);

  useEffect(() => {
    const open = deals.filter(d => d.stage !== 'lost');
    setTotalValue(open.reduce((s, d) => s + d.value, 0));
  }, [deals]);

  const handleDealClick = useCallback(async (deal: Deal) => {
    // For table view — open slide panel (simplified: navigate to deal)
    // In future: open DealSlideOver
    console.log('deal clicked', deal.id);
  }, []);

  const handleStageChange = useCallback(async (dealId: string, newStage: DealStage) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    await apiFetch(`/api/v1/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({ stage: newStage }),
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)',
        flexShrink: 0, background: 'var(--color-bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <h1 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Pipeline</h1>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            {fmtCompact(totalValue)} active
          </span>
        </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <IzButton variant="ghost" onClick={() => router.push('/deals/sheet')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-sm)' }}>
              Bulk Edit
            </IzButton>
          </div>
      </div>

      {/* View content */}
      <div style={{ flex: 1, minHeight: 0, overflow: view === 'kanban' ? 'hidden' : 'auto', padding: view === 'kanban' ? 0 : 'var(--space-5)' }}>
        {view === 'kanban' && <KanbanBoard initialDeals={deals} stages={stages} />}
        {view === 'table'  && <TableView deals={deals} onDealClick={handleDealClick} stages={stages} />}
        {view === 'funnel' && <FunnelView deals={deals} stages={stages} />}
      </div>
    </div>
  );
}


