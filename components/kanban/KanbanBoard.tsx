'use client';

import { useState, useCallback } from 'react';
import type { Deal, DealStage } from '@/core/schema/entities';
import KanbanColumn from './KanbanColumn';
import DealFormModal from './DealFormModal';
import styles from './kanban.module.scss';

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'new',         label: 'New',         color: 'var(--color-text-muted)' },
  { id: 'contacted',   label: 'Contacted',   color: '#6366f1' },
  { id: 'qualified',   label: 'Qualified',   color: '#0ea5e9' },
  { id: 'proposal',    label: 'Proposal',    color: '#f59e0b' },
  { id: 'negotiation', label: 'Negotiation', color: '#f97316' },
  { id: 'won',         label: 'Won',         color: '#10b981' },
  { id: 'lost',        label: 'Lost',        color: '#ef4444' },
];

interface Props {
  initialDeals: Deal[];
}

export default function KanbanBoard({ initialDeals }: Props) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [dragging, setDragging] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimistic stage move
  const moveCard = useCallback(async (dealId: string, toStage: DealStage) => {
    const prev = deals.find(d => d.id === dealId);
    if (!prev || prev.stage === toStage) return;

    // Optimistic update
    setDeals(ds => ds.map(d => d.id === dealId ? { ...d, stage: toStage } : d));

    try {
      const res = await fetch(`/api/v1/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: toStage }),
      });
      if (!res.ok) throw new Error('Failed to update deal stage');
    } catch (err) {
      // Rollback on error
      setDeals(ds => ds.map(d => d.id === dealId ? { ...d, stage: prev.stage } : d));
      setError('Failed to move deal. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  }, [deals]);

  const handleDealCreated = useCallback((deal: Deal) => {
    setDeals(prev => [deal, ...prev]);
    setShowModal(false);
  }, []);

  const columnDeals = (stage: DealStage) => deals.filter(d => d.stage === stage);

  const totalValue = deals
    .filter(d => d.stage !== 'lost')
    .reduce((sum, d) => sum + d.value, 0);

  const wonValue = deals
    .filter(d => d.stage === 'won')
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={styles.board}>
      {/* Board header */}
      <div className={styles.boardHeader}>
        <div className={styles.boardStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Active Pipeline</span>
            <span className={styles.statValue}>{formatCurrency(totalValue)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Won</span>
            <span className={styles.statValue + ' ' + styles.statWon}>{formatCurrency(wonValue)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Deals</span>
            <span className={styles.statValue}>{deals.length}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Deal
        </button>
      </div>

      {/* Error toast */}
      {error && <div className={styles.errorToast}>{error}</div>}

      {/* Columns */}
      <div className={styles.columns}>
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={columnDeals(stage.id)}
            draggingId={dragging}
            onDragStart={setDragging}
            onDrop={moveCard}
          />
        ))}
      </div>

      {/* New Deal Modal */}
      {showModal && (
        <DealFormModal
          onClose={() => setShowModal(false)}
          onCreated={handleDealCreated}
        />
      )}
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}
