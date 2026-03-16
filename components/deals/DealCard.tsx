'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Deal } from '@/core/schema/entities';

interface Props {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

function formatValue(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return v > 0 ? `$${v.toLocaleString()}` : '$0';
}

export default function DealCard({ deal, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`deal-card${isDragging ? ' deal-card--dragging' : ''}`}
      onClick={() => !isDragging && onClick(deal)}
      {...attributes}
      {...listeners}
    >
      <div className="deal-card__name" title={deal.name}>{deal.name}</div>
      <div className="deal-card__value">{formatValue(deal.value)}</div>
    </div>
  );
}
