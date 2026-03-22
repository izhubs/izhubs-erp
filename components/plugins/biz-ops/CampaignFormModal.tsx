'use client';

import { useState } from 'react';
import { IzButton } from '@/components/ui/IzButton';
import styles from './BizOpsProjects.module.scss';

interface CampaignFormData {
  id?: string;
  contract_id: string;
  name: string;
  type: string;
  allocated_budget: number;
  stage: string;
  health: string;
  start_date: string;
  end_date: string;
}

interface ContractOption {
  id: string;
  title: string;
}

interface Props {
  contracts: ContractOption[];
  initial?: Partial<CampaignFormData>;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  onClose: () => void;
}

const EMPTY: CampaignFormData = {
  contract_id: '', name: '', type: 'general', allocated_budget: 0,
  stage: 'planning', health: 'healthy', start_date: '', end_date: '',
};

export function CampaignFormModal({ contracts, initial, onSubmit, onClose }: Props) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<CampaignFormData>({
    ...EMPTY,
    contract_id: contracts[0]?.id ?? '',
    ...initial,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof CampaignFormData, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.contract_id) { setError('Please select a contract'); return; }
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
          <h2>{isEdit ? 'Edit Project' : 'New Project'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Project Name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. SEO Campaign Q1"
              autoFocus
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Contract *</label>
              <select
                value={form.contract_id}
                onChange={e => set('contract_id', e.target.value)}
                disabled={isEdit}
              >
                {contracts.length === 0 && <option value="">No contracts</option>}
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="general">General</option>
                <option value="seo">SEO</option>
                <option value="ads">Ads</option>
                <option value="social">Social</option>
                <option value="web">Web</option>
                <option value="construction">Construction</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Budget</label>
              <input
                type="number"
                value={form.allocated_budget}
                onChange={e => set('allocated_budget', parseFloat(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Health</label>
              <select value={form.health} onChange={e => set('health', e.target.value)}>
                <option value="healthy">🟢 Healthy</option>
                <option value="at_risk">🟡 At Risk</option>
                <option value="delayed">🔴 Delayed</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Stage</label>
            <input
              value={form.stage}
              onChange={e => set('stage', e.target.value)}
              placeholder="e.g. planning, execution, review"
            />
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

          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>

        <div className={styles.modalFooter}>
          <IzButton variant="ghost" onClick={onClose} disabled={loading}>Cancel</IzButton>
          <IzButton onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Create Project'}
          </IzButton>
        </div>
      </div>
    </div>
  );
}
