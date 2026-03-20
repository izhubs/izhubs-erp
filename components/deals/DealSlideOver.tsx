'use client';

import { useState } from 'react';
import type { Deal, DealStage } from '@/core/schema/entities';
import { apiFetch } from '@/lib/apiFetch';
import clsx from 'clsx';
import { PIPELINE_STAGES } from '@/core/config/pipeline';
import styles from './kanban.module.scss';
import { IzSheet, IzSheetContent, IzSheetHeader, IzSheetBody, IzSheetFooter, IzSheetTitle } from '@/components/ui/IzSheet';
import { IzInput } from '@/components/ui/IzInput';
import { IzButton } from '@/components/ui/IzButton';
import { IzSelect } from '@/components/ui/IzSelect';


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
    <IzSheet open={true} onOpenChange={(o) => !o && onClose()}>
      <IzSheetContent size="md">
        <IzSheetHeader style={{ paddingBottom: 0 }}>
          <IzSheetTitle>
            <IzInput
              className="slideover__title-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Deal name"
              aria-label="Deal name"
              style={{ fontSize: '1.25rem', fontWeight: 700 }}
            />
          </IzSheetTitle>
        </IzSheetHeader>

        <IzSheetBody>
          {error && <div className={styles.errorToast} style={{ marginBottom: 16 }}>{error}</div>}

          <div className="slideover__field">
            <span className="slideover__label">Value ($)</span>
            <IzInput
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              min="0"
              step="0.01"
            />
          </div>

          <div className="slideover__field">
            <span className="slideover__label">Stage</span>
            <IzSelect
              wrapperClassName="slideover-select-wrapper"
              value={{ label: PIPELINE_STAGES.find(s => s.id === form.stage)?.label, value: form.stage }}
              onChange={(selected: { value: string; label: string }) => setForm({ ...form, stage: selected.value as DealStage })}
              options={PIPELINE_STAGES.map(s => ({ label: s.label, value: s.id }))}
            />
          </div>

          <div className="slideover__field tooltip-wrapper" title="Coming soon">
            <span className="slideover__label">Owner</span>
            <IzInput value="@me" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div className="slideover__field tooltip-wrapper" title="Coming soon">
            <span className="slideover__label">Contact</span>
            <IzInput placeholder="Link contact..." disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          
          <div className="slideover__divider" />

          {/* Metadata Info Box */}
          <div style={{
            marginTop: '8px',
            padding: '12px 16px',
            background: 'var(--color-bg-hover)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--color-text-muted)'
          }}>
            {deal.closedAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Closed</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                  {new Date(deal.closedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Created</span>
              <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                {new Date(deal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </IzSheetBody>

        <IzSheetFooter>
          <IzButton variant="ghost" className="text-danger hover:bg-danger/10 hover:text-danger" style={{ color: 'var(--color-danger)' }} onClick={handleDelete} disabled={loading}>
            Delete
          </IzButton>
          <div style={{ display: 'flex', gap: '8px' }}>
            <IzButton variant="ghost" onClick={onClose} disabled={loading}>Cancel</IzButton>
            <IzButton variant="default" onClick={handleSave} disabled={!hasChanges || loading} isLoading={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </IzButton>
          </div>
        </IzSheetFooter>
      </IzSheetContent>

      <style dangerouslySetInnerHTML={{__html: `
        .slideover__title-input {
          font-family: inherit;
          color: var(--color-text);
          border: 1px solid transparent;
          background: transparent;
          border-radius: var(--radius-sm);
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .slideover__title-input:hover, .slideover__title-input:focus {
          border-color: var(--color-border);
          background: var(--color-bg-base);
        }
        .slideover__divider {
          height: 1px;
          background: var(--color-border);
          margin: 16px 0;
        }
        .slideover__field {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .slideover__field:last-of-type {
          border-bottom: none;
        }
        .slideover__label {
          flex: 0 0 120px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-subtle, #64748b);
          margin-bottom: 0;
        }
        .slideover__field > div:not(.slideover-select-wrapper),
        .slideover__field input,
        .slideover__field .slideover-select-wrapper {
          flex: 1;
        }
        .slideover__field > div:not(.slideover-select-wrapper) input {
          border-color: transparent !important;
          background-color: transparent !important;
          box-shadow: none !important;
          padding-left: 8px;
          padding-right: 0;
          transition: background-color 0.2s;
          border-radius: var(--radius-sm);
        }
        .slideover__field > div:not(.slideover-select-wrapper):hover input, 
        .slideover__field > div:not(.slideover-select-wrapper):focus-within input {
          background-color: var(--color-bg-hover) !important;
        }
      `}} />
    </IzSheet>
  );
}
