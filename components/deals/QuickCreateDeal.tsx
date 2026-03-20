'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { IzInput } from '@/components/ui/IzInput';
import { IzButton } from '@/components/ui/IzButton';

interface Props {
  stage: string;
  onCreated: (deal: any) => void;
  onCancel: () => void;
}

export default function QuickCreateDeal({ stage, onCreated, onCancel }: Props) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/deals', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), value: Number(value) || 0, stage }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed');
      onCreated(json.data);
    } catch {
      // silent fail — user can retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="quick-create" onSubmit={handleSubmit}>
      <IzInput
        className="quick-create__input"
        placeholder="Deal name…"
        value={name}
        onChange={(e: { target: { value: string } }) => setName(e.target.value)}
        autoFocus
      />
      <IzInput
        className="quick-create__input"
        type="number"
        placeholder="Value (0)"
        value={value}
        onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
        min={0}
      />
      <div className="quick-create__actions">
        <IzButton variant="ghost" type="button" className="quick-create__btn quick-create__btn--ghost" onClick={onCancel}>
          Cancel
        </IzButton>
        <IzButton variant="default" type="submit" className="quick-create__btn quick-create__btn--primary" disabled={loading || !name.trim()}>
          {loading ? '…' : 'Add'}
        </IzButton>
      </div>
    </form>
  );
}
