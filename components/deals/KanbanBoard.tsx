'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { Deal } from '@/core/schema/entities';
import KanbanColumn from './KanbanColumn';
import DealSlideOver from './DealSlideOver';

// Dynamic import for DealCard inside overlay (avoids bundling dnd-kit globally)
const DealCardOverlay = dynamic(() => import('./DealCard'), { ssr: false });

const STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
] as const;

interface Props {
  initialDeals: Deal[];
}

export default function KanbanBoard({ initialDeals }: Props) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;
  const stageDeals = (stage: string) => deals.filter(d => d.stage === stage);

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  }, []);

  const handleDragEnd = useCallback(async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as string;
    const deal = deals.find(d => d.id === dealId);

    if (!deal || deal.stage === newStage) return;

    // Optimistic update
    const prev = deals;
    setDeals(d => d.map(deal => deal.id === dealId ? { ...deal, stage: newStage as any } : deal));

    try {
      const res = await fetch(`/api/v1/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error('Update failed');
    } catch {
      // Rollback
      setDeals(prev);
    }
  }, [deals]);

  const handleDealCreated = useCallback((deal: Deal) => {
    setDeals(prev => [deal, ...prev]);
  }, []);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        <div className="kanban-columns">
          {STAGES.map(({ id, label }) => (
            <KanbanColumn
              key={id}
              stage={id}
              label={label}
              deals={stageDeals(id)}
              onDealClick={setSelectedDeal}
              onDealCreated={handleDealCreated}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeDeal && (
          <DealCardOverlay deal={activeDeal} onClick={() => {}} />
        )}
      </DragOverlay>

      {selectedDeal && (
        <DealSlideOver deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
      )}
    </DndContext>
  );
}
