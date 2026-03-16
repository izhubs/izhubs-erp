'use client';

import type { Deal } from '@/core/schema/entities';
import styles from './kanban.module.scss';

interface Props {
  deal: Deal;
  isDragging: boolean;
  onDragStart: (id: string) => void;
}

export default function DealCard({ deal, isDragging, onDragStart }: Props) {
  const formatValue = (v: number) => {
    if (!v) return null;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <div
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('dealId', deal.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(deal.id);
      }}
      onDragEnd={() => onDragStart('')}
    >
      <div className={styles.cardName}>{deal.name}</div>
      {deal.value > 0 && (
        <div className={styles.cardValue}>{formatValue(deal.value)}</div>
      )}
    </div>
  );
}
