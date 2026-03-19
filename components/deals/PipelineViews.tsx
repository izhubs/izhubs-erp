'use client';

// =============================================================
// izhubs ERP — Pipeline View Switcher
// 3 views: Kanban (default) | Table | Funnel
// Persists selected view in localStorage.
// =============================================================

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Deal, DealStage } from '@/core/schema/entities';
import { PIPELINE_STAGES } from '@/core/config/pipeline';
import Badge from '@/components/shared/Badge';
import { apiFetch } from '@/lib/apiFetch';

// Kanban is already complex — keep lazy
const KanbanBoard = dynamic(() => import('@/components/kanban/KanbanBoard'), { ssr: false });

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
function TableView({ deals, onDealClick }: { deals: Deal[]; onDealClick: (d: Deal) => void }) {
  const [sortKey, setSortKey] = useState<keyof Deal>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...deals].sort((a, b) => {
    const av = a[sortKey]; const bv = b[sortKey];
    if (av == null) return 1; if (bv == null) return -1;
    return sortAsc
      ? (av > bv ? 1 : -1)
      : (av < bv ? 1 : -1);
  });

  const toggleSort = (key: keyof Deal) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortTh = ({ k, label }: { k: keyof Deal; label: string }) => (
    <th
      onClick={() => toggleSort(k)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      {label} {sortKey === k ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  const stageMap = Object.fromEntries(PIPELINE_STAGES.map(s => [s.id, s]));
  const STAGE_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    won: 'success', lost: 'danger', active: 'info',
    renewal: 'warning', lead: 'neutral', proposal: 'primary' as 'info',
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <SortTh k="name" label="Tên deal" />
            <SortTh k="stage" label="Stage" />
            <SortTh k="value" label="Giá trị" />
            <th>Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(d => (
            <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => onDealClick(d)}>
              <td style={{ fontWeight: 500 }}>{d.name}</td>
              <td>
                <Badge variant={STAGE_VARIANT[d.stage] ?? 'neutral'}>
                  {stageMap[d.stage]?.label ?? d.stage}
                </Badge>
              </td>
              <td style={{ fontWeight: 600 }}>{formatVnd(d.value)}</td>
              <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                {new Date(d.createdAt ?? '').toLocaleDateString('vi-VN')}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>
              Không có deals nào
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---- Funnel View -----------------------------------------------
function FunnelView({ deals }: { deals: Deal[] }) {
  const openDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const stages = PIPELINE_STAGES.filter(s => !s.closed);
  const totalStages = stages.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: 640, margin: '0 auto' }}>
      {stages.map((stage, idx) => {
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
                  {count} deals{value > 0 ? ` · ${formatVnd(value)}` : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="card" style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-6)' }}>
        <Stat label="Tổng pipeline" value={formatVnd(openDeals.reduce((s, d) => s + d.value, 0))} />
        <Stat label="Won" value={formatVnd(deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0))} green />
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
export default function PipelineViews({ initialDeals }: { initialDeals: Deal[] }) {
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
            {formatVnd(totalValue)} active
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {/* View switcher */}
          <div style={{
            display: 'flex', background: 'var(--color-bg-hover)',
            borderRadius: 'var(--radius-lg)', padding: 3, gap: 2,
          }}>
            {(Object.keys(VIEW_ICONS) as ViewMode[]).map(v => (
              <button
                key={v}
                id={`pipeline-view-${v}`}
                onClick={() => setView(v)}
                title={VIEW_LABELS[v]}
                style={{
                  background: view === v ? 'var(--color-bg-card)' : 'transparent',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  padding: '6px 12px', cursor: 'pointer',
                  color: view === v ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: view === v ? 600 : 400,
                  fontSize: 'var(--font-size-sm)',
                  transition: 'all 0.15s ease',
                  boxShadow: view === v ? 'var(--shadow-sm)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span>{VIEW_ICONS[v]}</span>
                <span>{VIEW_LABELS[v]}</span>
              </button>
            ))}
          </div>

          <button className="btn btn-primary" style={{ marginLeft: 'var(--space-2)' }}
            onClick={() => {/* handled by KanbanBoard when in kanban view */}}>
            + New Deal
          </button>
        </div>
      </div>

      {/* View content */}
      <div style={{ flex: 1, minHeight: 0, overflow: view === 'kanban' ? 'hidden' : 'auto', padding: view === 'kanban' ? 0 : 'var(--space-5)' }}>
        {view === 'kanban' && <KanbanBoard initialDeals={deals} />}
        {view === 'table'  && <TableView deals={deals} onDealClick={handleDealClick} />}
        {view === 'funnel' && <FunnelView deals={deals} />}
      </div>
    </div>
  );
}

function formatVnd(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}Tỷđ`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}Mđ`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}Kđ`;
  return `${v}đ`;
}
