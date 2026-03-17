'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import type { Deal, DealStage } from '@/core/schema/entities';
import KanbanColumn from './KanbanColumn';
import DealCard from './DealCard';
import DealFormModal from './DealFormModal';
import DealSlideOver from '@/components/deals/DealSlideOver';
import styles from './kanban.module.scss';
import { apiFetch } from '@/lib/apiFetch';
import { PIPELINE_STAGES } from '@/core/config/pipeline';

interface Props {
  initialDeals: Deal[];
}

export default function KanbanBoard({ initialDeals }: Props) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [defaultStage, setDefaultStage] = useState<DealStage>('new');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleStages = useMemo(
    () => PIPELINE_STAGES.filter(s => showClosed || !s.closed),
    [showClosed]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts (allows clicking elements inside card)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Drag Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Deal') {
      setActiveDeal(active.data.current.deal);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Moving a deal over another deal OR over an empty column
    const isActiveADeal = active.data.current?.type === 'Deal';
    const isOverADeal = over.data.current?.type === 'Deal';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveADeal) return;

    if (isOverADeal) {
      setDeals((currentDeals) => {
        const activeIndex = currentDeals.findIndex(d => d.id === activeId);
        const overIndex = currentDeals.findIndex(d => d.id === overId);
        if (currentDeals[activeIndex].stage !== currentDeals[overIndex].stage) {
          const newDeals = [...currentDeals];
          newDeals[activeIndex] = { ...newDeals[activeIndex], stage: currentDeals[overIndex].stage };
          return newDeals;
        }
        return currentDeals;
      });
    }

    if (isOverAColumn) {
      setDeals((currentDeals) => {
        const activeIndex = currentDeals.findIndex(d => d.id === activeId);
        if (currentDeals[activeIndex].stage !== overId) {
          const newDeals = [...currentDeals];
          newDeals[activeIndex] = { ...newDeals[activeIndex], stage: overId as DealStage };
          return newDeals;
        }
        return currentDeals;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const activeDealId = active.id as string;
    const finalStage = deals.find(d => d.id === activeDealId)?.stage;
    const originalStage = initialDeals.find(d => d.id === activeDealId)?.stage;

    // If stage actually changed, call API
    if (finalStage && originalStage && finalStage !== originalStage) {
      try {
        const res = await apiFetch(`/api/v1/deals/${activeDealId}`, {
          method: 'PATCH',
          body: JSON.stringify({ stage: finalStage }),
        });
        if (!res.ok) throw new Error('Failed to update deal stage');
      } catch {
        // Rollback
        setDeals(current => current.map(d => d.id === activeDealId ? { ...d, stage: originalStage } : d));
        setError('Failed to move deal. Please try again.');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // --- CRUD Handlers ---
  const handleDealCreated = useCallback((deal: Deal) => {
    setDeals(prev => [deal, ...prev]);
    setShowModal(false);
  }, []);

  const handleDealUpdated = useCallback((deal: Deal) => {
    setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
    setSelectedDeal(deal);
  }, []);

  const handleDealDeleted = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
    setSelectedDeal(null);
  }, []);

  const openAddDeal = useCallback((stage: DealStage) => {
    setDefaultStage(stage);
    setShowModal(true);
  }, []);

  const columnDeals = (stage: DealStage) => deals.filter(d => d.stage === stage);
  const totalValue = deals.filter(d => d.stage !== 'lost').reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
  };

  return (
    <div className={styles.board}>
      {/* Board header */}
      <div className={styles.boardHeader}>
        <div className={styles.boardStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Active Pipeline</span>
            <span className={styles.statValue}>{formatCurrency(totalValue)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Won</span>
            <span className={`${styles.statValue} ${styles.statWon}`}>{formatCurrency(wonValue)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Deals</span>
            <span className={styles.statValue}>{deals.length}</span>
          </div>
        </div>

        <div className={styles.boardActions}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={showClosed}
              onChange={e => setShowClosed(e.target.checked)}
              className={styles.toggleCheckbox}
            />
            Show Won/Lost
          </label>
          <button className="btn btn-primary" onClick={() => openAddDeal('new')}>
            + New Deal
          </button>
        </div>
      </div>

      {error && <div className={styles.errorToast}>{error}</div>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.columns}>
          {visibleStages.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={columnDeals(stage.id)}
              onCardClick={setSelectedDeal}
              onAddDeal={openAddDeal}
            />
          ))}
        </div>

        {typeof window !== 'undefined' && createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDeal ? <DealCard deal={activeDeal} isOverlay /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {showModal && (
        <DealFormModal
          defaultStage={defaultStage}
          onClose={() => setShowModal(false)}
          onCreated={handleDealCreated}
        />
      )}

      {selectedDeal && (
        <DealSlideOver
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdated={handleDealUpdated}
          onDeleted={handleDealDeleted}
        />
      )}
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}
