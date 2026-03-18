'use client';

// =============================================================
// ContactFormModal — react-hook-form + zodResolver
// Supports: create/edit, bilingual EN/VI, dynamic custom fields
// from IndustryTemplate.customFields (entity: 'contact' | 'company')
// =============================================================

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Contact } from '@/core/schema/entities';
import { useLanguage } from '@/components/providers/LanguageProvider';
import styles from './contacts.module.scss';

// ── Zod schema ──────────────────────────────────────────────

const ContactFormSchema = z.object({
  name:         z.string().min(1, 'Name is required').max(200),
  email:        z.string().email('Invalid email').or(z.literal('')).optional(),
  phone:        z.string().max(50).optional(),
  title:        z.string().max(200).optional(),
  customFields: z.record(z.string()).optional(),
});

type ContactFormValues = z.infer<typeof ContactFormSchema>;

// ── Custom field definitions (from template) ─────────────────

interface TemplateField {
  entity:   'contact' | 'company' | 'deal';
  key:      string;
  label:    string;
  type:     'text' | 'select' | 'number' | 'date';
  options?: string[];
}

interface Props {
  contact:        Contact | null;   // null = create, Contact = edit
  onClose:        () => void;
  onCreated:      (c: Contact) => void;
  onUpdated:      (c: Contact) => void;
  customFields?:  TemplateField[];  // from active IndustryTemplate
}

// ── Dynamic field renderer ───────────────────────────────────

function DynamicField({
  field, register, value,
}: {
  field: TemplateField;
  register: ReturnType<typeof useForm<ContactFormValues>>['register'];
  value?: string;
}) {
  const fieldKey = `customFields.${field.key}` as const;

  if (field.type === 'select' && field.options) {
    return (
      <label className="form-label">
        {field.label}
        <select
          className="form-control"
          defaultValue={value ?? ''}
          {...register(fieldKey as Parameters<typeof register>[0])}
        >
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
        defaultValue={value ?? ''}
        {...register(fieldKey as Parameters<typeof register>[0])}
      />
    </label>
  );
}

// ── Main component ───────────────────────────────────────────

export default function ContactFormModal({ contact, onClose, onCreated, onUpdated, customFields = [] }: Props) {
  const { locale } = useLanguage();
  const isVi = locale === 'vi';
  const isEdit = contact !== null;

  const relevantFields = customFields.filter(f => f.entity === 'contact');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name:  contact?.name  ?? '',
      email: contact?.email ?? '',
      phone: contact?.phone ?? '',
      title: contact?.title ?? '',
      customFields: (contact as unknown as { customFields?: Record<string, string> })?.customFields ?? {},
    },
  });

  useEffect(() => {
    if (contact) {
      reset({
        name:  contact.name,
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        title: contact.title ?? '',
        customFields: (contact as unknown as { customFields?: Record<string, string> })?.customFields ?? {},
      });
    }
  }, [contact, reset]);

  const onSubmit = async (values: ContactFormValues) => {
    const payload = {
      name:         values.name.trim(),
      email:        values.email?.trim() || undefined,
      phone:        values.phone?.trim() || undefined,
      title:        values.title?.trim() || undefined,
      customFields: values.customFields,
    };

    const url    = isEdit ? `/api/v1/contacts/${contact.id}` : '/api/v1/contacts';
    const method = isEdit ? 'PATCH' : 'POST';

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();

    if (!res.ok) {
      setError('root', { message: json.error?.message || 'Request failed' });
      return;
    }
    isEdit ? onUpdated(json.data) : onCreated(json.data);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEdit
              ? (isVi ? 'Chỉnh sửa liên hệ' : 'Edit Contact')
              : (isVi ? 'Tạo liên hệ mới' : 'New Contact')}
          </h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.modalForm} noValidate>
          {/* Core fields */}
          <label className="form-label">
            {isVi ? 'Tên *' : 'Name *'}
            <input
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              {...register('name')}
              placeholder={isVi ? 'Họ và tên' : 'Full name'}
              autoFocus
            />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </label>

          <label className="form-label">
            {isVi ? 'Email' : 'Email'}
            <input
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              type="email"
              {...register('email')}
              placeholder="email@company.com"
            />
            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          </label>

          <div className={styles.formRow}>
            <label className="form-label" style={{ flex: 1 }}>
              {isVi ? 'Điện thoại' : 'Phone'}
              <input className="form-control" {...register('phone')} placeholder="+84 9xx xxx xxx" />
            </label>
            <label className="form-label" style={{ flex: 1 }}>
              {isVi ? 'Chức danh' : 'Title'}
              <input className="form-control" {...register('title')} placeholder={isVi ? 'Giám đốc, Kế toán…' : 'CEO, Engineer…'} />
            </label>
          </div>

          {/* Dynamic custom fields */}
          {relevantFields.length > 0 && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-3) 0 var(--space-2)' }} />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 var(--space-3)' }}>
                {isVi ? 'Thông tin bổ sung' : 'Additional Fields'}
              </p>
              {relevantFields.map(f => (
                <DynamicField
                  key={f.key}
                  field={f}
                  register={register}
                  value={(contact as unknown as { customFields?: Record<string, string> })?.customFields?.[f.key]}
                />
              ))}
            </>
          )}

          {errors.root && <p className={styles.modalError}>{errors.root.message}</p>}

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {isVi ? 'Huỷ' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? (isVi ? 'Đang lưu…' : 'Saving…')
                : isEdit
                  ? (isVi ? 'Lưu thay đổi' : 'Save Changes')
                  : (isVi ? 'Tạo liên hệ' : 'Create Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
