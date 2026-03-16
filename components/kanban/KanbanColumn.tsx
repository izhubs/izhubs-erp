'use client';

import { useRef } from 'react';
import type { Deal, DealStage } from '@/core/schema/entities';
import DealCard from './DealCard';
import styles from './kanban.module.scss';

interface StageConfig {
  id: DealStage;
  label: string;
  color: string;
}

interface Props {
  stage: StageConfig;
  deals: Deal[];
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDrop: (dealId: string, stage: DealStage) => void;
}

export default function KanbanColumn({ stage, deals, draggingId, onDragStart, onDrop }: Props) {
  const columnValue = deals.reduce((sum, d) => sum + d.value, 0);
  const isDragOver = useRef(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    isDragOver.current = true;
    (e.currentTarget as HTMLElement).classList.add(styles.columnDragOver!);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    isDragOver.current = false;
    (e.currentTarget as HTMLElement).classList.remove(styles.columnDragOver!);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).classList.remove(styles.columnDragOver!);
    const id = e.dataTransfer.getData('dealId');
    if (id) onDrop(id, stage.id);
  };

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return v > 0 ? `$${v}` : '';
  };

  return (
    <div
      className={styles.column}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <span
            className={styles.stageDot}
            style={{ background: stage.color }}
          />
          <span>{stage.label}</span>
          <span className={styles.columnCount}>{deals.length}</span>
        </div>
        {columnValue > 0 && (
          <span className={styles.columnValue}>{formatValue(columnValue)}</span>
        )}
      </div>

      {/* Cards */}
      <div className={styles.columnCards}>
        {deals.length === 0 ? (
          <div className={styles.emptyColumn}>Drop cards here</div>
        ) : (
          deals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              isDragging={draggingId === deal.id}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
