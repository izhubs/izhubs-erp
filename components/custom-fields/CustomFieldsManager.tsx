'use client';

import { useState, useCallback } from 'react';
import type { CustomFieldDefinition } from '@/core/schema/entities';
import styles from './custom-fields.module.scss';
import { apiFetch } from '@/lib/apiFetch';
import { IzButton } from '@izerp-theme/components/ui/IzButton';
import { IzInput } from '@izerp-theme/components/ui/IzInput';
import { IzTextarea } from '@izerp-theme/components/ui/IzTextarea';
import { IzSelect } from '@izerp-theme/components/ui/IzSelect';
import { IzCheckbox } from '@izerp-theme/components/ui/IzCheckbox';

type EntityType = 'contact' | 'company' | 'deal' | 'activity';
type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'url' | 'email' | 'phone';

const ENTITY_TABS: { id: EntityType; label: string; icon: string }[] = [
  { id: 'contact', label: 'Contacts', icon: '👥' },
  { id: 'deal', label: 'Deals', icon: '📊' },
  { id: 'company', label: 'Companies', icon: '🏢' },
  { id: 'activity', label: 'Activities', icon: '📋' },
];

const FIELD_TYPES: { id: FieldType; label: string }[] = [
  { id: 'text', label: 'Text' },
  { id: 'number', label: 'Number' },
  { id: 'date', label: 'Date' },
  { id: 'boolean', label: 'Checkbox' },
  { id: 'select', label: 'Single Select' },
  { id: 'multiselect', label: 'Multi Select' },
  { id: 'url', label: 'URL' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
];

const TYPE_BADGE_COLORS: Record<FieldType, string> = {
  text: '#6366f1', number: '#0ea5e9', date: '#f59e0b',
  boolean: '#10b981', select: '#f97316', multiselect: '#f97316',
  url: '#8b5cf6', email: '#ec4899', phone: '#14b8a6',
};

interface Props {
  initialFields: CustomFieldDefinition[];
}

const EMPTY_FORM = { label: '', key: '', type: 'text' as FieldType, required: false, options: '' };

export default function CustomFieldsManager({ initialFields }: Props) {
  const [activeTab, setActiveTab] = useState<EntityType>('contact');
  const [fields, setFields] = useState<CustomFieldDefinition[]>(initialFields);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tabFields = fields.filter(f => f.entityType === activeTab);

  // Auto-generate key from label
  const handleLabelChange = (label: string) => {
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    setForm(f => ({ ...f, label, key }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const options = ['select', 'multiselect'].includes(form.type)
      ? form.options.split('\n').map(s => s.trim()).filter(Boolean)
      : undefined;

    try {
      const res = await apiFetch('/api/v1/custom-fields', {
        method: 'POST',
        body: JSON.stringify({
          entityType: activeTab,
          key: form.key,
          label: form.label,
          type: form.type,
          required: form.required,
          options,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create field');
      setFields(prev => [...prev, json.data]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [form, activeTab]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this custom field? Existing values in records will be preserved.')) return;
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/v1/custom-fields/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setFields(prev => prev.filter(f => f.id !== id));
    } catch {
      alert('Failed to delete field');
    } finally {
      setDeletingId(null);
    }
  }, []);

  const needsOptions = ['select', 'multiselect'].includes(form.type);

  return (
    <div className={styles.container}>
      {/* Entity tabs */}
      <div className={styles.tabs}>
        {ENTITY_TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab(tab.id); setShowForm(false); setError(null); }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {fields.filter(f => f.entityType === tab.id).length > 0 && (
              <span className={styles.tabBadge}>
                {fields.filter(f => f.entityType === tab.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {/* Fields table */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                {ENTITY_TABS.find(t => t.id === activeTab)?.label} Fields
              </h2>
              <p className={styles.cardSubtitle}>
                Custom fields appear in {activeTab} records and forms.
              </p>
            </div>
            <IzButton variant="default" onClick={() => { setShowForm(true); setForm(EMPTY_FORM); }}>
              + Add Field
            </IzButton>
          </div>

          {tabFields.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚙️</div>
              <p className={styles.emptyTitle}>No custom fields yet</p>
              <p className={styles.emptySubtitle}>
                Add custom fields to capture extra data on {activeTab} records.
              </p>
              <IzButton variant="default" onClick={() => setShowForm(true)}>
                + Add your first field
              </IzButton>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Key</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tabFields.map(field => (
                  <tr key={field.id} className={styles.row}>
                    <td className={styles.fieldLabel}>{field.label}</td>
                    <td><code className={styles.keyBadge}>{field.key}</code></td>
                    <td>
                      <span className={styles.typeBadge} style={{ background: TYPE_BADGE_COLORS[field.type] + '20', color: TYPE_BADGE_COLORS[field.type] }}>
                        {FIELD_TYPES.find(t => t.id === field.type)?.label ?? field.type}
                      </span>
                    </td>
                    <td>
                      <span className={field.required ? styles.reqYes : styles.reqNo}>
                        {field.required ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td>
                      <IzButton
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(field.id)}
                        disabled={deletingId === field.id}
                        title="Delete field"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        ✕
                      </IzButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add field form */}
        {showForm && (
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>New Field for {ENTITY_TABS.find(t => t.id === activeTab)?.label}</h3>
              <IzButton variant="ghost" size="icon" onClick={() => { setShowForm(false); setError(null); }}>✕</IzButton>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <label className="form-label" style={{ flex: 1 }}>
                  Label *
                  <IzInput
                    value={form.label}
                    onChange={e => handleLabelChange(e.target.value)}
                    placeholder="e.g. LinkedIn URL"
                    autoFocus
                    required
                  />
                </label>
                <label className="form-label" style={{ flex: 1 }}>
                  Key (auto-generated)
                  <IzInput
                    value={form.key}
                    onChange={e => setForm(f => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                    placeholder="linkedin_url"
                    pattern="^[a-z_][a-z0-9_]*$"
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className="form-label" style={{ flex: 1 }}>
                  Type *
                  <IzSelect
                    value={{ label: FIELD_TYPES.find(t => t.id === form.type)?.label, value: form.type }}
                    onChange={(selected: any) => setForm(f => ({ ...f, type: selected.value as FieldType }))}
                    options={FIELD_TYPES.map(t => ({ value: t.id, label: t.label }))}
                  />
                </label>
                <label className="form-label" style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <IzCheckbox
                    checked={form.required}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, required: e.target.checked }))}
                    label="Required field"
                  />
                </label>
              </div>

              {needsOptions && (
                <label className="form-label">
                  Options (one per line) *
                  <IzTextarea
                    value={form.options}
                    onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
                    placeholder={"Option A\nOption B\nOption C"}
                    rows={4}
                    required={needsOptions}
                    style={{ fontFamily: 'monospace' }}
                  />
                </label>
              )}

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.formActions} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <IzButton type="button" variant="ghost" onClick={() => { setShowForm(false); setError(null); }}>Cancel</IzButton>
                <IzButton type="submit" variant="default" disabled={loading} isLoading={loading}>
                  {loading ? 'Creating…' : 'Create Field'}
                </IzButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
