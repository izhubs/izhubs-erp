'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import type { Campaign } from '@/modules/biz-ops/engine/campaigns';
import CampaignKanbanColumn from './CampaignKanbanColumn';
import CampaignKanbanCard from './CampaignKanbanCard';
import { IzKanbanBoard } from '@/components/ui/IzKanbanBoard';
import { IzButton } from '@/components/ui/IzButton';
import { apiFetch } from '@/lib/apiFetch';
import { useRouter } from 'next/navigation';

export const PROJECT_STAGES = [
  { id: 'planning', label: 'Planning', color: '#64748b' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'delayed', label: 'Delayed', color: '#f59e0b' },
  { id: 'completed', label: 'Completed', color: '#10b981' },
];

interface Props {
  initialCampaigns: Campaign[];
}

export default function CampaignsKanbanBoard({ initialCampaigns }: Props) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Campaign') {
      setActiveCampaign(active.data.current.campaign);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCampaign(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const originalStage = campaigns.find(c => c.id === activeId)?.stage;

    let targetStage: string | undefined;
    if (over.data.current?.type === 'Column') targetStage = over.id as string;
    else if (over.data.current?.type === 'Campaign') targetStage = over.data.current.campaign?.stage;

    if (!targetStage || !originalStage || targetStage === originalStage) return;

    setCampaigns(current => current.map(c => c.id === activeId ? { ...c, stage: targetStage! } : c));

    try {
      const res = await apiFetch(`/api/v1/biz-ops/campaigns/${activeId}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: targetStage }),
      });
      if (!res.ok) throw new Error('Failed to update stage');
    } catch {
      setCampaigns(current => current.map(c => c.id === activeId ? { ...c, stage: originalStage } : c));
      setError('Failed to move project. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const openAddProject = useCallback((stage: string) => {
    // We will expand on this. For now, prompt or open modal (modal not rebuilt yet)
    router.push(`?new=1&stage=${stage}`);
  }, [router]);

  const dropAnimation = {
    duration: 250,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, margin: '16px 24px', borderRadius: 6 }}>{error}</div>}

      <div style={{ flex: 1, padding: '0 24px 24px 24px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <IzKanbanBoard style={{ height: 'calc(100vh - 150px)', display: 'flex', gap: 16 }}>
            {PROJECT_STAGES.map(stage => (
              <CampaignKanbanColumn
                key={stage.id}
                stage={stage}
                campaigns={campaigns.filter(c => c.stage === stage.id)}
                onCardClick={(c) => router.push(`/plugins/biz-ops/campaigns/${c.id}`)}
                onAddCampaign={openAddProject}
              />
            ))}
          </IzKanbanBoard>

          {typeof window !== 'undefined' && createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeCampaign ? <CampaignKanbanCard campaign={activeCampaign} isOverlay /> : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
}
