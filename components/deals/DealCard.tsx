'use client';

import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Deal } from '@/core/schema/entities';
import { PIPELINE_STAGES } from '@/core/config/pipeline';
import styles from './kanban.module.scss';
import { IzKanbanCard } from '@/components/ui/IzKanbanBoard';
import { useCurrency } from '@/lib/hooks/useCurrency';

interface Props {
  deal: Deal;
  isOverlay?: boolean;
  onClick?: () => void;
}

// Cover color based on package tier
const PKG_COLORS: Record<string, string> = {
  Enterprise: '#6366f1',
  Pro:        '#0ea5e9',
  Basic:      '#10b981',
};

function valueTierColor(deal: Deal): string {
  const pkg = (deal.customFields as Record<string, string>)?.goi_dich_vu;
  if (pkg && PKG_COLORS[pkg]) return PKG_COLORS[pkg];
  if (deal.value >= 10_000_000) return '#6366f1';
  if (deal.value >= 3_000_000)  return '#0ea5e9';
  return '#10b981';
}



function relativeAge(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return 'hôm nay';
  if (days === 1) return '1d';
  if (days < 7)  return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return `${Math.floor(days / 30)}mo`;
}

function ownerInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DealCard({ deal, isOverlay, onClick }: Props) {
  const { fmtCompact } = useCurrency();
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: deal.id, data: { type: 'Deal', deal } });

  // When using DragOverlay, the original card becomes a ghost placeholder.
  // We must NOT apply transform to it — the overlay handles the visual drag.
  // Using CSS.Translate.toString (translate-only, no scale) prevents layout shifts
  // when dragging between columns or outside the board.
  const style: CSSProperties = {
    transition,
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
  };

  const isOverdue = deal.updatedAt
    ? Date.now() - new Date(deal.updatedAt).getTime() > 14 * 86_400_000
    : false;

  const stageConfig = PIPELINE_STAGES.find(s => s.id === deal.stage);
  const coverColor  = valueTierColor(deal);
  const pkg = (deal.customFields as Record<string, string>)?.goi_dich_vu;

  return (
    <IzKanbanCard
      ref={setNodeRef}
      style={{
        ...style,
        borderLeft: `4px solid ${coverColor}`,
      }}
      className={[
        isDragging && !isOverlay ? styles.cardDragging : '',
        isOverlay ? styles.cardOverlay : '',
      ].filter(Boolean).join(' ')}
      onClick={isDragging ? undefined : onClick}
      title={deal.name}
      description={
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
          <span
            className={styles.cardLabel}
            style={{ background: stageConfig?.color || '#8590a2', width: 32, height: 6, borderRadius: 4 }}
            title={stageConfig?.label}
          />
          {pkg && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: '1px 6px', borderRadius: 4,
              background: (PKG_COLORS[pkg] ?? '#64748b') + '22',
              color: PKG_COLORS[pkg] ?? '#94a3b8',
              letterSpacing: '0.02em',
            }}>
              {pkg}
            </span>
          )}
        </div>
      }
      footerLeft={
        deal.updatedAt ? (
          <span className={`${styles.cardBadge} ${isOverdue ? styles.cardBadgeOverdue : ''}`}
            title={isOverdue ? 'Quá 14 ngày không cập nhật' : ''}>
            📅 {relativeAge(deal.updatedAt)}
          </span>
        ) : <span />
      }
      footerRight={
        <div className={styles.cardMeta} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}>
          <span className={styles.cardValue} style={{ margin: 0 }}>{fmtCompact(deal.value)}</span>
          <div className={styles.cardAvatars} style={{ margin: 0 }}>
            <span
              className={styles.cardAvatar}
              title={deal.ownerId ?? 'Chưa phân công'}
              style={{
                background: deal.ownerId ? '#6366f1' : 'var(--color-bg-elevated)',
                color: deal.ownerId ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              {ownerInitials(deal.ownerId)}
            </span>
          </div>
        </div>
      }
      {...attributes}
      {...listeners}
    />
  );
}
