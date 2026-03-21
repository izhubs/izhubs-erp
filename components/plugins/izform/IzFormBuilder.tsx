'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, Trash2, ArrowRight } from 'lucide-react';
import { IzButton } from '@/components/ui/IzButton';
import { IzInput } from '@/components/ui/IzInput';
import { IzTextarea } from '@/components/ui/IzTextarea';
import { IzSelect } from '@/components/ui/IzSelect';
import { IzCheckbox } from '@/components/ui/IzCheckbox';
import { IzCard, IzCardContent } from '@/components/ui/IzCard';
import styles from './IzFormBuilder.module.scss';

/* ── Types ── */
type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'number';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
}

const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
];

const PLACEHOLDER_MAP: Record<string, string> = {
  text: 'John Doe',
  email: 'john@example.com',
  phone: '+84 912 345 678',
  number: '50',
  textarea: 'Tell us more...',
  select: 'Select an option',
};

export default function IzFormBuilder() {
  const router = useRouter();
  const [formName, setFormName] = useState('Client Onboarding Survey');
  const [formDesc, setFormDesc] = useState('Gather essential information for initial client strategy sessions.');
  const [fields, setFields] = useState<FormField[]>([
    { id: 'f1', type: 'text', label: 'Full Name', required: true },
    { id: 'f2', type: 'email', label: 'Primary Email', required: true },
    { id: 'f3', type: 'number', label: 'Company Size', required: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Field CRUD ── */
  const addField = () => {
    setFields(prev => [...prev, {
      id: `f${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
    }]);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  /* ── Submit ── */
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/plugins/izform/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDesc || undefined,
          fields,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Failed to create form');
      router.push('/plugins/izform');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* ── LEFT: Editor ── */}
      <div className={styles.editorPane}>
        {/* Form basics */}
        <IzCard>
          <IzCardContent>
            <div className={styles.sectionTitle}>Form Details</div>

            <IzInput
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Client Onboarding Survey"
              required
            />

            <IzTextarea
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Describe this form's purpose..."
              rows={2}
              style={{ marginTop: '0.75rem' }}
            />
          </IzCardContent>
        </IzCard>

        {/* Fields */}
        <div>
          <div className={styles.fieldsHeader}>
            <h2 className={styles.fieldsHeaderTitle}>Fields</h2>
            <IzButton type="button" variant="outline" onClick={addField}>
              + Add Field
            </IzButton>
          </div>

          <div className={styles.fieldsList}>
            {fields.map(field => (
              <div key={field.id} className={styles.fieldRow}>
                <span className={styles.dragHandle}>
                  <GripVertical size={18} />
                </span>

                <div className={styles.fieldName}>
                  <IzInput
                    value={field.label}
                    onChange={e => updateField(field.id, { label: e.target.value })}
                    placeholder="Field label"
                  />
                </div>

                <div className={styles.fieldType}>
                  <IzSelect
                    options={FIELD_TYPE_OPTIONS}
                    value={FIELD_TYPE_OPTIONS.find(o => o.value === field.type)}
                    onChange={(val: any) => updateField(field.id, { type: val?.value as FieldType })}
                    menuPosition="fixed"
                  />
                </div>

                <div className={styles.requiredToggle}>
                  <IzCheckbox
                    label="Required"
                    checked={field.required}
                    onChange={e => updateField(field.id, { required: e.target.checked })}
                  />
                </div>

                <div className={styles.removeBtn}>
                  <IzButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(field.id)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 size={16} />
                  </IzButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p style={{ color: 'var(--color-status-error)', fontSize: '0.875rem' }}>{error}</p>}

        {/* Footer actions */}
        <div className={styles.footerActions}>
          <IzButton variant="outline" onClick={() => router.push('/plugins/izform')}>
            Cancel
          </IzButton>
          <IzButton
            onClick={handleSave}
            isLoading={loading}
            disabled={loading || !formName.trim()}
          >
            Save Form
          </IzButton>
        </div>
      </div>

      {/* ── RIGHT: Live Preview ── */}
      <div className={styles.previewPane}>
        {/* Background blobs */}
        <div className={styles.previewBg}>
          <div className={styles.blob1} />
          <div className={styles.blob2} />
        </div>

        {/* Live badge */}
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          <span className={styles.liveText}>Live Preview</span>
        </div>

        {/* Phone frame */}
        <div className={styles.phoneFrame}>
          <div className={styles.phoneNotch}>
            <span className={styles.notchDot} />
            <span className={styles.notchBar} />
          </div>

          <div className={styles.phoneContent}>
            {/* Title */}
            <div>
              <h3 className={styles.previewTitle}>
                {formName || 'Untitled Form'}
              </h3>
              {formDesc && (
                <p className={styles.previewDesc}>{formDesc}</p>
              )}
            </div>

            {/* Preview fields */}
            {fields.map(field => (
              <div key={field.id} className={styles.previewField}>
                <span className={styles.previewFieldLabel}>
                  {field.label || 'Untitled'}{field.required ? ' *' : ''}
                </span>
                <input
                  className={styles.previewFieldInput}
                  disabled
                  placeholder={PLACEHOLDER_MAP[field.type] || 'Enter value...'}
                  type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                />
              </div>
            ))}

            {/* Submit button */}
            <button className={styles.previewSubmitBtn} type="button" disabled>
              Submit
              <ArrowRight size={16} />
            </button>
          </div>

          <div className={styles.phoneHomeBar} />
        </div>
      </div>
    </div>
  );
}
