'use client';

import { useState } from 'react';
import type { Deal, DealStage } from '@/core/schema/entities';
import { apiFetch } from '@/lib/apiFetch';
import clsx from 'clsx'; // assume user installs clsx or we can write a simple join
import { PIPELINE_STAGES } from '@/core/config/pipeline';
import styles from '../kanban/kanban.module.scss'; // Reuse modal styles if needed, or inline

interface Props {
  deal: Deal;
  onClose: () => void;
  onUpdated?: (deal: Deal) => void;
  onDeleted?: (id: string) => void;
}

export default function DealSlideOver({ deal, onClose, onUpdated, onDeleted }: Props) {
  const [form, setForm] = useState({
    name: deal.name,
    value: deal.value.toString(),
    stage: deal.stage,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges =
    form.name !== deal.name ||
    form.value !== deal.value.toString() ||
    form.stage !== deal.stage;

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/v1/deals/${deal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name.trim(),
          value: parseFloat(form.value) || 0,
          stage: form.stage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update deal');
      onUpdated?.(json.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/v1/deals/${deal.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deal');
      onDeleted?.(deal.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="slideover-overlay" onClick={onClose} />
      <aside className="slideover" aria-label="Deal details">
        <div className="slideover__header">
          <input
            className="slideover__title-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Deal name"
            aria-label="Deal name"
          />
          <button className="slideover__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="slideover__body">
          {error && <div className={styles.errorToast} style={{ marginBottom: 16 }}>{error}</div>}

          <div className="slideover__field">
            <span className="slideover__label">Value ($)</span>
            <input
              type="number"
              className="form-control"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>

          <div className="slideover__field">
            <span className="slideover__label">Stage</span>
            <select
              className="form-control"
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })}
            >
              {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div className="slideover__field tooltip-wrapper" title="Coming soon">
            <span className="slideover__label">Owner</span>
            <input className="form-control" value="@me" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div className="slideover__field tooltip-wrapper" title="Coming soon">
            <span className="slideover__label">Contact</span>
            <input className="form-control" placeholder="Link contact..." disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          
          <div className="slideover__divider" />

          {deal.closedAt && (
            <div className="slideover__field">
              <span className="slideover__label">Closed At</span>
              <span className="slideover__value">{new Date(deal.closedAt).toLocaleDateString()}</span>
            </div>
          )}
          <div className="slideover__field">
            <span className="slideover__label">Created</span>
            <span className="slideover__value">{new Date(deal.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="slideover__footer" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <button className="btn btn-ghost" style={{ color: 'var(--color-danger)' }} onClick={handleDelete} disabled={loading}>
            Delete
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!hasChanges || loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </aside>

      {/* Quick inline CSS for the title input to make it look like a header */}
      <style dangerouslySetInnerHTML={{__html: `
        .slideover__title-input {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-text);
          border: 1px solid transparent;
          background: transparent;
          border-radius: var(--radius-sm);
          padding: 4px 8px;
          margin-left: -8px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .slideover__title-input:hover, .slideover__title-input:focus {
          border-color: var(--color-border);
          background: var(--color-bg-surface);
        }
        .slideover__divider {
          height: 1px;
          background: var(--color-border);
          margin: 24px 0;
        }
        .tooltip-wrapper {
          position: relative;
        }
      `}} />
    </>
  );
}
