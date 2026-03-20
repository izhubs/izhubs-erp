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
import { IzModal, IzModalContent, IzModalHeader, IzModalTitle, IzModalBody, IzModalFooter } from '@/components/ui/IzModal';
import { IzForm } from '@/components/ui/IzForm';
import { IzFormInput } from '@/components/ui/IzFormInput';
import { IzFormSelect } from '@/components/ui/IzFormSelect';
import { IzButton } from '@/components/ui/IzButton';
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

export default function ContactFormModal({ contact, onClose, onCreated, onUpdated, customFields = [] }: Props) {
  const { locale } = useLanguage();
  const isVi = locale === 'vi';
  const isEdit = contact !== null;

  const relevantFields = customFields.filter(f => f.entity === 'contact');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name:  contact?.name  ?? '',
      email: contact?.email ?? '',
      phone: contact?.phone ?? '',
      title: contact?.title ?? '',
      customFields: (contact as unknown as { customFields?: Record<string, string> })?.customFields ?? {},
    },
  });

  const { reset, formState: { errors, isSubmitting }, setError, handleSubmit } = form;

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
    <IzModal open={true} onOpenChange={(open) => !open && onClose()}>
      <IzModalContent size="md">
        <IzModalHeader>
          <IzModalTitle>
            {isEdit
              ? (isVi ? 'Chỉnh sửa liên hệ' : 'Edit Contact')
              : (isVi ? 'Tạo liên hệ mới' : 'New Contact')}
          </IzModalTitle>
        </IzModalHeader>

        <IzForm form={form} onSubmit={onSubmit}>
          <IzModalBody className={styles.modalForm} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
            {/* Core fields */}
            <IzFormInput
              name="name"
              label={isVi ? 'Tên *' : 'Name *'}
              placeholder={isVi ? 'Họ và tên' : 'Full name'}
              required
              autoFocus
            />

            <IzFormInput
              name="email"
              label={isVi ? 'Email' : 'Email'}
              type="email"
              placeholder="email@company.com"
            />

            <div className={styles.formRow} style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <IzFormInput name="phone" label={isVi ? 'Điện thoại' : 'Phone'} placeholder="+84 9xx xxx xxx" />
              </div>
              <div style={{ flex: 1 }}>
                <IzFormInput name="title" label={isVi ? 'Chức danh' : 'Title'} placeholder={isVi ? 'Giám đốc, Kế toán…' : 'CEO, Engineer…'} />
              </div>
            </div>

            {/* Dynamic custom fields */}
            {relevantFields.length > 0 && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-1) 0 0' }} />
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 calc(-1 * var(--space-2))' }}>
                  {isVi ? 'Thông tin bổ sung' : 'Additional Fields'}
                </p>
                {relevantFields.map(f => (
                  <DynamicField key={f.key} field={f} />
                ))}
              </>
            )}

            {errors.root && <p className={styles.modalError} style={{ color: 'var(--color-danger)' }}>{errors.root.message}</p>}
          </IzModalBody>

          <IzModalFooter>
            <IzButton variant="ghost" onClick={onClose} disabled={isSubmitting} type="button">
              {isVi ? 'Huỷ' : 'Cancel'}
            </IzButton>
            <IzButton variant="default" type="submit" isLoading={isSubmitting}>
              {isEdit
                ? (isVi ? 'Lưu thay đổi' : 'Save Changes')
                : (isVi ? 'Tạo liên hệ' : 'Create Contact')}
            </IzButton>
          </IzModalFooter>
        </IzForm>
      </IzModalContent>
    </IzModal>
  );
}
