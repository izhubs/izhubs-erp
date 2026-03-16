'use client';

import { useState } from 'react';
import type { Deal } from '@/core/schema/entities';
import styles from './kanban.module.scss';
import { apiFetch } from '@/lib/apiFetch';

interface Props {
  onClose: () => void;
  onCreated: (deal: Deal) => void;
}

export default function DealFormModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: '', value: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/v1/deals', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          value: parseFloat(form.value) || 0,
          stage: 'new',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create deal');
      onCreated(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>New Deal</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className="form-label">
            Deal name *
            <input
              className="form-control"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Acme Corp Enterprise"
              autoFocus
              required
            />
          </label>

          <label className="form-label">
            Value ($)
            <input
              className="form-control"
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder="0"
            />
          </label>

          {error && <p className={styles.modalError}>{error}</p>}

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
