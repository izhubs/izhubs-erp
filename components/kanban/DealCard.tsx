'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Deal } from '@/core/schema/entities';
import { PIPELINE_STAGES } from '@/core/config/pipeline';
import styles from './kanban.module.scss';

interface Props {
  deal: Deal;
  isOverlay?: boolean;
  onClick?: () => void;
}

// Color based on deal value tier (like Trello's cover color)
function valueTierColor(value: number): string {
  if (value >= 50_000)  return '#4bce97'; // green — big deal
  if (value >= 10_000)  return '#f5cd47'; // yellow — medium
  if (value >= 1_000)   return '#579dff'; // blue — small
  return '#8590a2';                        // gray — micro/zero
}

function formatValue(v: number): string {
  if (!v) return '$0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

function relativeAge(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

function ownerInitials(ownerId: string | null | undefined): string {
  if (!ownerId) return '?';
  return ownerId.slice(0, 2).toUpperCase();
}

export default function DealCard({ deal, isOverlay, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: 'Deal', deal },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const isOverdue = deal.updatedAt
    ? Date.now() - new Date(deal.updatedAt).getTime() > 14 * 86_400_000
    : false;

  const stageConfig = PIPELINE_STAGES.find(s => s.id === deal.stage);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        styles.card,
        isDragging && !isOverlay ? styles.cardDragging : '',
        isOverlay ? styles.cardOverlay : '',
      ].filter(Boolean).join(' ')}
      onClick={isDragging ? undefined : onClick}
      {...attributes}
      {...listeners}
    >
      {/* Trello-style color cover bar */}
      <div className={styles.cardCover} style={{ background: valueTierColor(deal.value) }} />

      <div className={styles.cardBody}>
        {/* Small label pills (stage color) */}
        <div className={styles.cardLabels}>
          <span
            className={styles.cardLabel}
            style={{ background: stageConfig?.color || '#8590a2' }}
            title={stageConfig?.label}
          />
        </div>

        {/* Card title */}
        <div className={styles.cardName}>{deal.name}</div>

        {/* Bottom metadata row — Trello badge style */}
        <div className={styles.cardMeta}>
          {/* Date badge */}
          {deal.updatedAt && (
            <span className={`${styles.cardBadge} ${isOverdue ? styles.cardBadgeOverdue : ''}`}>
              <span className={styles.cardBadgeIcon}>📅</span>
              {relativeAge(deal.updatedAt)}
            </span>
          )}

          {/* Value badge */}
          <span className={styles.cardValue}>{formatValue(deal.value)}</span>

          {/* Owner avatar (far right, Trello-style) */}
          <div className={styles.cardAvatars}>
            <span className={styles.cardAvatar} title={deal.ownerId ?? 'Unassigned'}>
              {ownerInitials(deal.ownerId)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
