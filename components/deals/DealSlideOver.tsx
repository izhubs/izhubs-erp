'use client';

import type { Deal } from '@/core/schema/entities';

interface Props {
  deal: Deal;
  onClose: () => void;
}

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return v > 0 ? `$${v.toLocaleString()}` : '$0';
}

const STAGE_LABELS: Record<string, string> = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified',
  proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

export default function DealSlideOver({ deal, onClose }: Props) {
  return (
    <>
      <div className="slideover-overlay" onClick={onClose} />
      <aside className="slideover" aria-label="Deal details">
        <div className="slideover__header">
          <h2 className="slideover__title">{deal.name}</h2>
          <button className="slideover__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="slideover__body">
          <div className="slideover__field">
            <span className="slideover__label">Value</span>
            <span className="slideover__value">{fmt(deal.value)}</span>
          </div>
          <div className="slideover__field">
            <span className="slideover__label">Stage</span>
            <span className="slideover__value">{STAGE_LABELS[deal.stage] ?? deal.stage}</span>
          </div>
          {deal.closedAt && (
            <div className="slideover__field">
              <span className="slideover__label">Closed</span>
              <span className="slideover__value">{new Date(deal.closedAt).toLocaleDateString()}</span>
            </div>
          )}
          <div className="slideover__field">
            <span className="slideover__label">Created</span>
            <span className="slideover__value">{new Date(deal.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="slideover__field">
            <span className="slideover__label">Last updated</span>
            <span className="slideover__value">{new Date(deal.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="slideover__footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </aside>
    </>
  );
}
