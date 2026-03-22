'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, Trash2, ArrowRight, Smartphone, Monitor, Zap, Send } from 'lucide-react';
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

interface IzFormBuilderProps {
  formId?: string;
}

export default function IzFormBuilder({ formId }: IzFormBuilderProps) {
  const router = useRouter();
  const isEditMode = !!formId;
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [fields, setFields] = useState<FormField[]>([
    { id: 'f1', type: 'text', label: 'Full Name', required: true },
    { id: 'f2', type: 'email', label: 'Email', required: true },
    { id: 'f3', type: 'phone', label: 'Phone', required: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoConvertLead, setAutoConvertLead] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  /* ── Fetch existing form for edit mode ── */
  useEffect(() => {
    if (!formId) return;
    (async () => {
      try {
        const res = await fetch(`/api/v1/plugins/izform/forms/${formId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message || 'Failed to load form');
        const form = json.data;
        setFormName(form.name);
        setFormDesc(form.description || '');
        setFields(form.fields);
        setWebhookUrl(form.webhookUrl || '');
        setAutoConvertLead(form.autoConvertLead || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setFetching(false);
      }
    })();
  }, [formId]);

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

  /* ── Submit (Create or Update) ── */
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = isEditMode
        ? `/api/v1/plugins/izform/forms/${formId}`
        : '/api/v1/plugins/izform/forms';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDesc || undefined,
          fields,
          webhookUrl: webhookUrl || undefined,
          autoConvertLead,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Failed to save form');
      router.push('/plugins/izform');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--color-text-subtle)' }}>
        Loading form...
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* ── LEFT: Editor ── */}
      <div className={styles.editorPane}>
        {/* Form basics */}
        <IzCard className={styles.formDetailsCard}>
          <IzCardContent>
            <div className={styles.sectionTitle}>Form Details</div>

            <div className={styles.formGroup}>
              <label className={styles.formGroupLabel}>Form Name *</label>
              <IzInput
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Client Onboarding Survey"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formGroupLabel}>Description</label>
              <IzTextarea
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Describe this form's purpose..."
                rows={3}
              />
            </div>
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

        {/* Settings — Webhook & Lead Routing */}
        <IzCard className={styles.formDetailsCard}>
          <IzCardContent>
            <div className={styles.sectionTitle}>
              <Zap size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />
              Integrations
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formGroupLabel}>Webhook URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <IzInput
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                  />
                </div>
              {webhookUrl && (
                  <IzButton
                    type="button"
                    variant="outline"
                    disabled={testingWebhook}
                    isLoading={testingWebhook}
                    onClick={async () => {
                      setTestingWebhook(true);
                      setWebhookStatus(null);
                      try {
                        const res = await fetch(`/api/v1/plugins/izform/forms/${formId || 'test'}/webhook-test`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ url: webhookUrl }),
                        });
                        const json = await res.json();
                        setWebhookStatus(res.ok ? `✅ Sent — HTTP ${json.data?.status}` : `❌ Failed`);
                      } catch {
                        setWebhookStatus('❌ Connection error');
                      } finally {
                        setTestingWebhook(false);
                        setTimeout(() => setWebhookStatus(null), 8000);
                      }
                    }}
                  >
                    <Send size={14} /> Test
                  </IzButton>
                )}
              </div>
              {webhookStatus && <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{webhookStatus}</span>}
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)', cursor: 'pointer' }}>
                  Sample POST payload sent on each submission
                </summary>
                <pre style={{
                  fontSize: '0.625rem',
                  background: 'rgba(0,0,0,0.03)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginTop: '0.375rem',
                  overflow: 'auto',
                  lineHeight: 1.5,
                  color: 'var(--color-text-secondary)',
                }}>
{JSON.stringify({
  event: 'form.submission',
  formId: formId || '<form-uuid>',
  formName: formName || 'Your Form',
  submission: {
    id: '<submission-uuid>',
    data: Object.fromEntries(fields.map(f => [f.label, `<${f.type} value>`])),
    submittedAt: '2026-01-01T00:00:00.000Z',
  },
  timestamp: '2026-01-01T00:00:00.000Z',
}, null, 2)}
                </pre>
              </details>
            </div>

            <div className={styles.formGroup}>
              <IzCheckbox
                label="Auto-convert to Lead"
                checked={autoConvertLead}
                onChange={e => setAutoConvertLead(e.target.checked)}
                description="Automatically create a Contact from form submissions"
              />
            </div>
          </IzCardContent>
        </IzCard>

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

        {/* Top bar: badge + device toggle */}
        <div className={styles.previewTopBar}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span className={styles.liveText}>Live Preview</span>
          </div>
          <div className={styles.deviceToggle}>
            <button
              className={`${styles.deviceBtn} ${previewDevice === 'mobile' ? styles.deviceBtnActive : ''}`}
              onClick={() => setPreviewDevice('mobile')}
              title="Mobile view"
            >
              <Smartphone size={16} />
            </button>
            <button
              className={`${styles.deviceBtn} ${previewDevice === 'desktop' ? styles.deviceBtnActive : ''}`}
              onClick={() => setPreviewDevice('desktop')}
              title="Desktop view"
            >
              <Monitor size={16} />
            </button>
          </div>
        </div>

        {/* Preview content - shared between both modes */}
        {previewDevice === 'mobile' ? (
          /* ── Mobile Phone Frame ── */
          <div className={styles.phoneFrame}>
            <div className={styles.phoneNotch}>
              <span className={styles.notchDot} />
              <span className={styles.notchBar} />
            </div>
            <div className={styles.phoneContent}>
              <div>
                <h3 className={styles.previewTitle}>{formName || 'Untitled Form'}</h3>
                {formDesc && <p className={styles.previewDesc}>{formDesc}</p>}
              </div>
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
              <button className={styles.previewSubmitBtn} type="button" disabled>
                Submit <ArrowRight size={16} />
              </button>
            </div>
            <div className={styles.phoneHomeBar} />
          </div>
        ) : (
          /* ── Desktop Browser Frame ── */
          <div className={styles.desktopFrame}>
            <div className={styles.desktopTitleBar}>
              <div className={styles.desktopDots}>
                <span className={styles.dotRed} />
                <span className={styles.dotYellow} />
                <span className={styles.dotGreen} />
              </div>
              <div className={styles.desktopUrlBar}>
                yoursite.com/forms/embed
              </div>
            </div>
            <div className={styles.desktopContent}>
              <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                <div>
                  <h3 className={styles.previewTitle}>{formName || 'Untitled Form'}</h3>
                  {formDesc && <p className={styles.previewDesc}>{formDesc}</p>}
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  <button className={styles.previewSubmitBtn} type="button" disabled>
                    Submit <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
