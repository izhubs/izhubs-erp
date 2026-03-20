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
import { IzModal, IzModalContent, IzModalHeader, IzModalTitle, IzModalBody, IzModalFooter } from '@/components/ui/IzModal';
import { IzForm } from '@/components/ui/IzForm';
import { IzFormInput } from '@/components/ui/IzFormInput';
import { IzFormSelect } from '@/components/ui/IzFormSelect';
import { IzButton } from '@/components/ui/IzButton';
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

function DynamicField({ field }: { field: TemplateField }) {
  const fieldKey = `customFields.${field.key}` as const;

  if (field.type === 'select' && field.options) {
    const opts = field.options.map(o => ({ label: o, value: o }));
    return <IzFormSelect name={fieldKey} label={field.label} options={opts} />;
  }

  const inputType = field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text';
  return <IzFormInput name={fieldKey} label={field.label} type={inputType} />;
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

  const form = useForm<DealFormValues>({
    resolver: zodResolver(DealFormSchema) as import('react-hook-form').Resolver<DealFormValues>,
    defaultValues: {
      name:         '',
      value:        0,
      stage:        defaultStage,
      customFields: {},
    },
  });

  const { formState: { errors, isSubmitting }, setError, handleSubmit } = form;

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
    <IzModal open={true} onOpenChange={(open) => !open && onClose()}>
      <IzModalContent size="md">
        <IzModalHeader>
          <IzModalTitle>{isVi ? 'Tạo deal mới' : 'New Deal'}</IzModalTitle>
        </IzModalHeader>

        <IzForm form={form} onSubmit={onSubmit}>
          <IzModalBody className={styles.modalForm} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
            {/* Deal name */}
            <IzFormInput
              name="name"
              label={isVi ? 'Tên deal *' : 'Deal name *'}
              placeholder={isVi ? 'VD: Công ty ABC — Gói Pro' : 'e.g. Acme Corp — Pro Package'}
              required
              autoFocus
            />

            <div className={styles.formRow} style={{ display: 'flex', gap: 'var(--space-4)' }}>
              {/* Value */}
              <div style={{ flex: 1 }}>
                <IzFormInput
                  name="value"
                  label={isVi ? 'Giá trị (VND)' : 'Value (VND)'}
                  type="number"
                  placeholder="0"
                />
              </div>

              {/* Stage */}
              <div style={{ flex: 1 }}>
                <IzFormSelect
                  name="stage"
                  label={isVi ? 'Giai đoạn' : 'Stage'}
                  options={pipelineStages.map(s => ({ label: s.label, value: s.key }))}
                />
              </div>
            </div>

            {/* Dynamic custom fields (deal entity) */}
            {dealFields.length > 0 && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-1) 0 0' }} />
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 calc(-1 * var(--space-2))' }}>
                  {isVi ? 'Thông tin gói dịch vụ' : 'Service Details'}
                </p>
                {dealFields.map(f => (
                  <DynamicField key={f.key} field={f} />
                ))}
              </>
            )}

            {errors.root && <p className={styles.modalError} style={{ color: 'var(--color-danger)' }}>{errors.root.message}</p>}
          </IzModalBody>

          <IzModalFooter>
            <IzButton variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              {isVi ? 'Huỷ' : 'Cancel'}
            </IzButton>
            <IzButton variant="default" type="submit" isLoading={isSubmitting}>
              {isVi ? 'Tạo deal' : 'Create Deal'}
            </IzButton>
          </IzModalFooter>
        </IzForm>
      </IzModalContent>
    </IzModal>
  );
}
