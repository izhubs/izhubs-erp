'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Deal } from '@/core/schema/entities';
import DealCard from './DealCard';
import QuickCreateDeal from './QuickCreateDeal';

const STAGE_COLORS: Record<string, string> = {
  new: '#94a3b8', contacted: '#6366f1', qualified: '#0ea5e9',
  proposal: '#f59e0b', negotiation: '#f97316', won: '#22c55e', lost: '#ef4444',
};

function formatValue(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return v > 0 ? `$${v.toLocaleString()}` : '$0';
}

interface Props {
  stage: string;
  label: string;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDealCreated: (deal: Deal) => void;
}

export default function KanbanColumn({ stage, label, deals, onDealClick, onDealCreated }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const colClass = [
    'kanban-col',
    isOver ? 'kanban-col--over' : '',
    stage === 'won' ? 'kanban-col--won' : '',
    stage === 'lost' ? 'kanban-col--lost' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={colClass}>
      <div className="kanban-col__header">
        <div className="kanban-col__title-row">
          <span className="kanban-col__dot" style={{ background: STAGE_COLORS[stage] }} />
          <span className="kanban-col__title">{label}</span>
        </div>
        <div className="kanban-col__meta">
          <span>{deals.length} deal{deals.length !== 1 ? 's' : ''}</span>
          {totalValue > 0 && <span>{formatValue(totalValue)}</span>}
        </div>
      </div>

      <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="kanban-col__cards">
          {deals.length === 0 && !showCreate && (
            <div className="kanban-col__empty">
              <span>Drop deals here</span>
            </div>
          )}
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
          ))}
        </div>
      </SortableContext>

      <div className="kanban-col__footer">
        {showCreate ? (
          <QuickCreateDeal
            stage={stage}
            onCreated={deal => { onDealCreated(deal); setShowCreate(false); }}
            onCancel={() => setShowCreate(false)}
          />
        ) : (
          <button className="kanban-add-btn" onClick={() => setShowCreate(true)}>
            + Add deal
          </button>
        )}
      </div>
    </div>
  );
}
