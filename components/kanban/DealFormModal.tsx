'use client';

// =============================================================
// DealFormModal — react-hook-form + zodResolver
// Supports: create, bilingual EN/VI, dynamic custom fields
// from IndustryTemplate.customFields (entity: 'deal')
// Uses Virtual Office pipeline stages by default.
// =============================================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Deal, DealStage } from '@/core/schema/entities';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { apiFetch } from '@/lib/apiFetch';
import styles from './kanban.module.scss';

// ── Zod schema ──────────────────────────────────────────────

const DealFormSchema = z.object({
  name:         z.string().min(1, 'Deal name is required').max(200),
  value:        z.coerce.number().min(0),
  stage:        z.string().min(1),
  customFields: z.record(z.string()).optional(),
});

type DealFormValues = z.infer<typeof DealFormSchema>;

// ── Custom field definitions (from template) ─────────────────

interface TemplateField {
  entity:   'contact' | 'company' | 'deal';
  key:      string;
  label:    string;
  type:     'text' | 'select' | 'number' | 'date';
  options?: string[];
}

interface PipelineStage {
  key:   string;
  label: string;
  color: string;
}

interface Props {
  onClose:         () => void;
  onCreated:       (deal: Deal) => void;
  defaultStage?:   DealStage;
  pipelineStages?: PipelineStage[];
  customFields?:   TemplateField[];
}

// Default Virtual Office stages (fallback if template not provided)
const VO_STAGES: PipelineStage[] = [
  { key: 'lead',        label: 'New Lead',       color: '#94a3b8' },
  { key: 'proposal',    label: 'Proposal Sent',  color: '#60a5fa' },
  { key: 'negotiation', label: 'Negotiation',    color: '#f59e0b' },
  { key: 'onboarding',  label: 'Onboarding',     color: '#a78bfa' },
  { key: 'active',      label: 'Active Client',  color: '#34d399' },
  { key: 'renewal',     label: 'Up for Renewal', color: '#f97316' },
  { key: 'won',         label: 'Won',            color: '#22c55e' },
  { key: 'lost',        label: 'Lost',           color: '#ef4444' },
];

// ── Dynamic field renderer ───────────────────────────────────

function DynamicField({
  field,
  register,
}: {
  field:    TemplateField;
  register: ReturnType<typeof useForm<DealFormValues>>['register'];
}) {
  const fieldKey = `customFields.${field.key}` as Parameters<typeof register>[0];

  if (field.type === 'select' && field.options) {
    return (
      <label className="form-label">
        {field.label}
        <select className="form-control" defaultValue="" {...register(fieldKey)}>
          <option value="">—</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="form-label">
      {field.label}
      <input
        className="form-control"
        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
        {...register(fieldKey)}
      />
    </label>
  );
}

// ── Main component ───────────────────────────────────────────

export default function DealFormModal({
  onClose,
  onCreated,
  defaultStage = 'new',
  pipelineStages = VO_STAGES,
  customFields = [],
}: Props) {
  const { locale } = useLanguage();
  const isVi = locale === 'vi';

  const dealFields = customFields.filter(f => f.entity === 'deal');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<DealFormValues>({
    resolver: zodResolver(DealFormSchema) as import('react-hook-form').Resolver<DealFormValues>,
    defaultValues: {
      name:         '',
      value:        0,
      stage:        defaultStage,
      customFields: {},
    },
  });

  const onSubmit = async (values: DealFormValues) => {
    const payload = {
      name:         values.name.trim(),
      value:        values.value,
      stage:        values.stage,
      customFields: values.customFields,
    };

    try {
      const res  = await apiFetch('/api/v1/deals', { method: 'POST', body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create deal');
      onCreated(json.data);
    } catch (err) {
      setError('root', { message: err instanceof Error ? err.message : 'Something went wrong' });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isVi ? 'Tạo deal mới' : 'New Deal'}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.modalForm} noValidate>
          {/* Deal name */}
          <label className="form-label">
            {isVi ? 'Tên deal *' : 'Deal name *'}
            <input
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              {...register('name')}
              placeholder={isVi ? 'VD: Công ty ABC — Gói Pro' : 'e.g. Acme Corp — Pro Package'}
              autoFocus
            />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </label>

          <div className={styles.formRow}>
            {/* Value */}
            <label className="form-label" style={{ flex: 1 }}>
              {isVi ? 'Giá trị (VND)' : 'Value (VND)'}
              <input
                className="form-control"
                type="number"
                min="0"
                step="1000"
                {...register('value', { valueAsNumber: true })}
                placeholder="0"
              />
            </label>

            {/* Stage */}
            <label className="form-label" style={{ flex: 1 }}>
              {isVi ? 'Giai đoạn' : 'Stage'}
              <select className="form-control" {...register('stage')}>
                {pipelineStages.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Dynamic custom fields (deal entity) */}
          {dealFields.length > 0 && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-3) 0 var(--space-2)' }} />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 var(--space-3)' }}>
                {isVi ? 'Thông tin gói dịch vụ' : 'Service Details'}
              </p>
              {dealFields.map(f => (
                <DynamicField key={f.key} field={f} register={register} />
              ))}
            </>
          )}

          {errors.root && <p className={styles.modalError}>{errors.root.message}</p>}

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {isVi ? 'Huỷ' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (isVi ? 'Đang tạo…' : 'Creating…') : (isVi ? 'Tạo deal' : 'Create Deal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
