'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IzKanbanColumn } from '@/components/ui/IzKanbanBoard';
import type { Campaign } from '@/modules/biz-ops/engine/campaigns';
import CampaignKanbanCard from './CampaignKanbanCard';
import { IzButton } from '@/components/ui/IzButton';
import { useMemo } from 'react';
import styles from './BizOpsProjects.module.scss'; // Reuse styling rules

interface StageConfig { id: string; label: string; color: string; }

interface Props {
  stage: StageConfig;
  campaigns: Campaign[];
  onCardClick: (campaign: Campaign) => void;
  onAddCampaign: (stage: string) => void;
}

export default function CampaignKanbanColumn({ stage, campaigns, onCardClick, onAddCampaign }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: 'Column', stage: stage.id },
  });

  const campaignIds = useMemo(() => campaigns.map(c => c.id), [campaigns]);

  return (
    <IzKanbanColumn
      ref={setNodeRef}
      title={stage.label}
      count={campaigns.length}
      style={{ borderTop: `4px solid ${stage.color || 'var(--color-border)'}`, opacity: isOver ? 0.9 : 1 }}
    >
      <SortableContext items={campaignIds} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {campaigns.length === 0 ? (
            <IzButton
              variant="outline"
              onClick={() => onAddCampaign(stage.id)}
              style={{ width: '100%', borderStyle: 'dashed', color: 'var(--color-text-muted)' }}
            >
              + Create project
            </IzButton>
          ) : (
            campaigns.map(campaign => (
              <CampaignKanbanCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => onCardClick(campaign)}
              />
            ))
          )}
        </div>
      </SortableContext>

      {campaigns.length > 0 && (
        <IzButton variant="ghost" onClick={() => onAddCampaign(stage.id)} style={{ marginTop: 'var(--space-3)', width: '100%', justifyContent: 'flex-start', color: 'var(--color-text-muted)' }}>
          + New project...
        </IzButton>
      )}
    </IzKanbanColumn>
  );
}
