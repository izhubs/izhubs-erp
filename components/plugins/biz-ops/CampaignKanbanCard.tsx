'use client';

import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IzKanbanCard } from '@/components/ui/IzKanbanBoard';
import type { Campaign } from '@/modules/biz-ops/engine/campaigns';
import styles from './BizOpsProjects.module.scss';
import { IzAvatar, IzAvatarFallback, IzAvatarImage } from '@/components/ui/IzAvatar';

interface Props {
  campaign: Campaign & { members?: { user_name: string; user_avatar_url: string | null }[] };
  isOverlay?: boolean;
  onClick?: () => void;
}

const HEALTH_MAP: Record<string, { color: string; label: string }> = {
  healthy:   { color: '#10b981', label: 'Healthy' },
  at_risk:   { color: '#f59e0b', label: 'At Risk' },
  delayed:   { color: '#ef4444', label: 'Delayed' },
  completed: { color: '#6366f1', label: 'Done' }
};

const TYPE_LABELS: Record<string, string> = {
  seo: 'SEO', ads: 'Ads', social: 'Social', web: 'Web',
  construction: 'Construction', general: 'General',
};

function formatBudget(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

export default function CampaignKanbanCard({ campaign, isOverlay, onClick }: Props) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: campaign.id, data: { type: 'Campaign', campaign } });

  const style: CSSProperties = {
    transition,
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
  };

  const health = HEALTH_MAP[campaign.health] ?? HEALTH_MAP.healthy;
  const budgetPct = campaign.allocated_budget > 0
    ? Math.min((campaign.actual_cogs / campaign.allocated_budget) * 100, 100)
    : 0;

  return (
    <IzKanbanCard
      ref={setNodeRef}
      style={{
        ...style,
        borderLeft: `4px solid ${campaign.type === 'web' ? '#6366f1' : '#0ea5e9'}`,
        cursor: isDragging ? 'grabbing' : 'pointer'
      }}
      className={[
        isDragging && !isOverlay ? styles.cardDragging : '',
        isOverlay ? styles.cardOverlay : '',
      ].filter(Boolean).join(' ')}
      onClick={isDragging ? undefined : onClick}
      title={campaign.name}
      description={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: health.color, background: `${health.color}15`, padding: '2px 6px', borderRadius: 4 }}>
              {health.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {TYPE_LABELS[campaign.type] ?? campaign.type}
            </span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Spent:</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
              {formatBudget(campaign.actual_cogs)} / {formatBudget(campaign.allocated_budget)}
            </span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'var(--color-bg-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${budgetPct}%`, 
              height: '100%', 
              background: budgetPct > 80 ? '#ef4444' : '#3b82f6' 
            }} />
          </div>
        </div>
      }
      footerLeft={
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          {new Date(campaign.created_at).toLocaleDateString()}
        </span>
      }
      footerRight={
        <div style={{ display: 'flex', marginLeft: '-4px' }}>
          {campaign.members && campaign.members.length > 0 ? (
            campaign.members.slice(0, 3).map((m, i) => (
              <IzAvatar key={i} size="sm" style={{ border: '2px solid var(--color-bg-surface)', marginLeft: i > 0 ? '-8px' : 0, width: 24, height: 24 }}>
                {m.user_avatar_url && <IzAvatarImage src={m.user_avatar_url} />}
                <IzAvatarFallback style={{ fontSize: 10 }}>{m.user_name.charAt(0).toUpperCase()}</IzAvatarFallback>
              </IzAvatar>
            ))
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--color-text-muted)' }}>
              ?
            </div>
          )}
        </div>
      }
      {...attributes}
      {...listeners}
    />
  );
}
