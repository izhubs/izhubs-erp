'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Deal, DealStage } from '@/core/schema/entities';
import type { PipelineStageConfig } from '@/core/config/pipeline';
import DealCard from './DealCard';
import styles from './kanban.module.scss';
import { useMemo } from 'react';
import { IzKanbanColumn } from '@/components/ui/IzKanbanBoard';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { IzButton } from '@/components/ui/IzButton';

interface Props {
  stage: PipelineStageConfig;
  deals: Deal[];
  onCardClick: (deal: Deal) => void;
  onAddDeal: (stage: DealStage) => void;
}

export default function KanbanColumn({ stage, deals, onCardClick, onAddDeal }: Props) {
  const columnValue = deals.reduce((sum, d) => sum + d.value, 0);
  const { fmtCompact } = useCurrency();

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: 'Column', stage: stage.id },
  });

  const dealIds = useMemo(() => deals.map(d => d.id), [deals]);

  return (
    <IzKanbanColumn
      ref={setNodeRef}
      className={isOver ? styles.columnDragOver : ''}
      title={stage.label}
      count={deals.length}
      style={{ borderTop: `4px solid ${stage.color || 'var(--color-border)'}` }}
      headerAction={
        columnValue > 0 ? (
          <span className={styles.columnValue} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>{fmtCompact(columnValue)}</span>
        ) : undefined
      }
    >
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {deals.length === 0 ? (
            <IzButton
              variant="outline"
              className={styles.emptyColumn}
              onClick={() => onAddDeal(stage.id)}
            >
              + Add a card
            </IzButton>
          ) : (
            deals.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={() => onCardClick(deal)}
              />
            ))
          )}
        </div>
      </SortableContext>

      {deals.length > 0 && (
        <IzButton variant="ghost" className={styles.addCardBtn} onClick={() => onAddDeal(stage.id)} style={{ marginTop: 'var(--space-2)' }}>
          <span className={styles.addCardIcon}>+</span>
          Add a card
        </IzButton>
      )}
    </IzKanbanColumn>
  );
}
