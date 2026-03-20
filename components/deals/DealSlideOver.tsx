'use client';

import { useState } from 'react';
import type { Deal, DealStage } from '@/core/schema/entities';
import { apiFetch } from '@/lib/apiFetch';

import { PIPELINE_STAGES } from '@/core/config/pipeline';
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
          {error && <div style={{ background: 'var(--color-danger-light, #fee2e2)', color: 'var(--color-danger)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

          {/* Value */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ flex: '0 0 100px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Value ($)</span>
            <IzInput
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              min="0" step="0.01"
              style={{ flex: 1, border: 'none', background: 'transparent', boxShadow: 'none', paddingLeft: '4px' }}
            />
          </div>

          {/* Stage */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ flex: '0 0 100px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Stage</span>
            <div style={{ flex: 1 }}>
              <IzSelect
                value={{ label: PIPELINE_STAGES.find(s => s.id === form.stage)?.label, value: form.stage }}
                onChange={(selected: { value: string; label: string }) => setForm({ ...form, stage: selected.value as DealStage })}
                options={PIPELINE_STAGES.map(s => ({ label: s.label, value: s.id }))}
              />
            </div>
          </div>

          {/* Owner */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)', opacity: 0.6 }} title="Coming soon">
            <span style={{ flex: '0 0 100px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Owner</span>
            <IzInput value="@me" disabled style={{ flex: 1, border: 'none', background: 'transparent', boxShadow: 'none', paddingLeft: '4px', cursor: 'not-allowed' }} />
          </div>

          {/* Contact */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)', opacity: 0.6 }} title="Coming soon">
            <span style={{ flex: '0 0 100px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Contact</span>
            <IzInput placeholder="Link contact..." disabled style={{ flex: 1, border: 'none', background: 'transparent', boxShadow: 'none', paddingLeft: '4px', cursor: 'not-allowed' }} />
          </div>

          <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />

          {/* Metadata */}
          <div style={{ padding: '10px 12px', background: 'var(--color-bg-hover, #f8fafc)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {deal.closedAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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

    </IzSheet>
  );
}
