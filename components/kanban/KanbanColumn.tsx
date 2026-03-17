'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Deal, DealStage } from '@/core/schema/entities';
import type { PipelineStageConfig } from '@/core/config/pipeline';
import DealCard from './DealCard';
import styles from './kanban.module.scss';
import { useMemo } from 'react';

interface Props {
  stage: PipelineStageConfig;
  deals: Deal[];
  onCardClick: (deal: Deal) => void;
  onAddDeal: (stage: DealStage) => void;
}

export default function KanbanColumn({ stage, deals, onCardClick, onAddDeal }: Props) {
  const columnValue = deals.reduce((sum, d) => sum + d.value, 0);

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: 'Column', stage: stage.id },
  });

  const dealIds = useMemo(() => deals.map(d => d.id), [deals]);

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return v > 0 ? `$${v}` : '';
  };

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnDragOver : ''}`}
    >
      {/* Trello-style colored accent bar at top */}
      <div className={styles.columnAccent} style={{ background: stage.color }} />

      {/* Column header */}
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <span>{stage.label}</span>
          <span className={styles.columnCount}>{deals.length}</span>
        </div>
        {columnValue > 0 && (
          <span className={styles.columnValue}>{formatValue(columnValue)}</span>
        )}
      </div>

      {/* Cards */}
      <div className={styles.columnCards}>
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <button
              className={styles.emptyColumn}
              onClick={() => onAddDeal(stage.id)}
            >
              + Add a card
            </button>
          ) : (
            deals.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={() => onCardClick(deal)}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Trello-style "Add Card" button at bottom of every column */}
      {deals.length > 0 && (
        <button className={styles.addCardBtn} onClick={() => onAddDeal(stage.id)}>
          <span className={styles.addCardIcon}>+</span>
          Add a card
        </button>
      )}
    </div>
  );
}
