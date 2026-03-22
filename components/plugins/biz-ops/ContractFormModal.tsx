'use client';

import { useState } from 'react';
import { IzButton } from '@/components/ui/IzButton';
import styles from './BizOpsProjects.module.scss';

interface ContractFormData {
  id?: string;
  title: string;
  code: string;
  total_value: number;
  currency: string;
  status: string;
  start_date: string;
  end_date: string;
  payment_terms: string;
  notes: string;
}

interface Props {
  initial?: Partial<ContractFormData>;
  onSubmit: (data: ContractFormData) => Promise<void>;
  onClose: () => void;
}

const EMPTY: ContractFormData = {
  title: '', code: '', total_value: 0, currency: 'VND',
  status: 'draft', start_date: '', end_date: '', payment_terms: '', notes: '',
};

export function ContractFormModal({ initial, onSubmit, onClose }: Props) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<ContractFormData>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof ContractFormData, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEdit ? 'Edit Contract' : 'New Contract'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. SEO + Ads Package 2026"
              autoFocus
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Code</label>
              <input
                value={form.code}
                onChange={e => set('code', e.target.value)}
                placeholder="HD-2026-001"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="signed">Signed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Total Value</label>
              <input
                type="number"
                value={form.total_value}
                onChange={e => set('total_value', parseFloat(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Currency</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Payment Terms</label>
            <input
              value={form.payment_terms}
              onChange={e => set('payment_terms', e.target.value)}
              placeholder="e.g. Net 30, 50% deposit"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>

        <div className={styles.modalFooter}>
          <IzButton variant="ghost" onClick={onClose} disabled={loading}>Cancel</IzButton>
          <IzButton onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Create Contract'}
          </IzButton>
        </div>
      </div>
    </div>
  );
}
