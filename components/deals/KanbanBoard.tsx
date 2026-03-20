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

import type { Deal, DealStage } from '@/core/schema/entities';
import KanbanColumn from './KanbanColumn';
import DealCard from './DealCard';
import DealFormModal from './DealFormModal';
import DealSlideOver from './DealSlideOver';
import styles from './kanban.module.scss';
import { apiFetch } from '@/lib/apiFetch';
import { PIPELINE_STAGES, type PipelineStageConfig } from '@/core/config/pipeline';
import { IzKanbanBoard } from '@/components/ui/IzKanbanBoard';
import { IzButton } from '@/components/ui/IzButton';
import { IzCheckbox } from '@/components/ui/IzCheckbox';

interface Props {
  initialDeals: Deal[];
  /** Pipeline stages from the tenant's industry template. Falls back to PIPELINE_STAGES. */
  stages?: PipelineStageConfig[];
}

export default function KanbanBoard({ initialDeals, stages: stagesProp }: Props) {
  const allStages = stagesProp ?? PIPELINE_STAGES;
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  // Custom auto-scroll: track drag state and rAF loop
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const scrollSpeedRef = useRef(0);

  // pointermove listener: compute scroll speed from cursor position relative to .columns rect
  useEffect(() => {
    const EDGE_SIZE = 80;   // px zone near each edge where scrolling activates
    const MAX_SPEED = 18;   // max px-per-frame at the very edge

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !columnsRef.current) {
        scrollSpeedRef.current = 0;
        return;
      }
      const rect = columnsRef.current.getBoundingClientRect();
      const distRight = rect.right - e.clientX;
      const distLeft  = e.clientX - rect.left;

      if (distRight < EDGE_SIZE && distRight >= 0) {
        // Approaching right edge — proportional speed
        scrollSpeedRef.current = ((EDGE_SIZE - distRight) / EDGE_SIZE) * MAX_SPEED;
      } else if (distLeft < EDGE_SIZE && distLeft >= 0) {
        // Approaching left edge — negative (scroll left)
        scrollSpeedRef.current = -((EDGE_SIZE - distLeft) / EDGE_SIZE) * MAX_SPEED;
      } else {
        scrollSpeedRef.current = 0;
      }
    };

    const loop = () => {
      if (columnsRef.current && scrollSpeedRef.current !== 0) {
        columnsRef.current.scrollLeft += scrollSpeedRef.current;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onPointerMove);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [defaultStage, setDefaultStage] = useState<DealStage>('new');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleStages = useMemo(
    () => allStages.filter(s => showClosed || !s.closed),
    [showClosed, allStages]
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
      isDraggingRef.current = true;
    }
  };

  const handleDragOver = () => {
    // No-op: cross-column moves happen only on drag end.
    // Prevents the jumpy layout shift when dragging between columns.
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    isDraggingRef.current = false;
    scrollSpeedRef.current = 0;
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const activeDealId = active.id as string;
    const originalStage = deals.find(d => d.id === activeDealId)?.stage;

    // Derive target stage from what was dropped onto
    let targetStage: DealStage | undefined;
    if (over.data.current?.type === 'Column') {
      targetStage = over.id as DealStage;
    } else if (over.data.current?.type === 'Deal') {
      targetStage = over.data.current.deal?.stage as DealStage;
    }

    if (!targetStage || !originalStage || targetStage === originalStage) return;

    // Optimistically update UI
    setDeals(current =>
      current.map(d => d.id === activeDealId ? { ...d, stage: targetStage! } : d)
    );

    // Persist to API
    try {
      const res = await apiFetch(`/api/v1/deals/${activeDealId}`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: targetStage }),
      });
      if (!res.ok) throw new Error('Failed to update deal stage');
    } catch {
      // Rollback on failure
      setDeals(current =>
        current.map(d => d.id === activeDealId ? { ...d, stage: originalStage } : d)
      );
      setError('Failed to move deal. Please try again.');
      setTimeout(() => setError(null), 3000);
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

  // Smoother drop animation — card glides to its new column instead of snapping
  const dropAnimation = {
    duration: 250,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
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
          <IzCheckbox
            checked={showClosed}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowClosed(e.target.checked)}
            label="Show Won/Lost"
          />
          <IzButton id="btn-add-deal" variant="default" onClick={() => openAddDeal((allStages[0]?.id ?? 'new') as DealStage)}>
            + New Deal
          </IzButton>
        </div>
      </div>

      {error && <div className={styles.errorToast}>{error}</div>}

      <div className={styles.columnsWrapper}>
        <IzButton
          variant="secondary"
          size="icon"
          className={styles.scrollBtn}
          aria-label="Scroll left"
          onClick={() => columnsRef.current?.scrollBy({ left: -290, behavior: 'smooth' })}
        >
          ‹
        </IzButton>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          autoScroll={false}   // disabled: using custom pointermove-based scroll (see useEffect)
        >
          <IzKanbanBoard className={styles.columns} ref={columnsRef as React.Ref<HTMLDivElement>}>
            {visibleStages.map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={columnDeals(stage.id)}
                onCardClick={setSelectedDeal}
                onAddDeal={openAddDeal}
              />
            ))}
          </IzKanbanBoard>

          {typeof window !== 'undefined' && createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeDeal ? <DealCard deal={activeDeal} isOverlay /> : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>

        <IzButton
          variant="secondary"
          size="icon"
          className={styles.scrollBtn}
          aria-label="Scroll right"
          onClick={() => columnsRef.current?.scrollBy({ left: 290, behavior: 'smooth' })}
        >
          ›
        </IzButton>
      </div>

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
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}Tỷđ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}Mđ`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}Kđ`;
  return `${value}đ`;
}
