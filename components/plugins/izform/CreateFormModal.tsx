'use client';

import { useState } from 'react';
import { IzButton } from '@/components/ui/IzButton';
import styles from './IzFormList.module.scss';

type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
}

interface FormData {
  id: string;
  name: string;
  description: string | null;
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
}

interface Props {
  onClose: () => void;
  onCreated: (form: FormData) => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Văn bản' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Số điện thoại' },
  { value: 'textarea', label: 'Đoạn văn' },
  { value: 'select', label: 'Dropdown' },
];

export function CreateFormModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([
    { id: 'f1', type: 'text', label: 'Họ tên', required: true },
    { id: 'f2', type: 'email', label: 'Email', required: true },
    { id: 'f3', type: 'phone', label: 'Số điện thoại', required: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addField = () => {
    const newField: FormField = {
      id: `f${Date.now()}`,
      type: 'text',
      label: 'Field mới',
      required: false,
    };
    setFields(prev => [...prev, newField]);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/plugins/izform/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || undefined, fields }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Tạo form thất bại');
      onCreated(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Tạo Form mới</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Đóng">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Name */}
          <div className={styles.formGroup}>
            <label htmlFor="form-name">Tên form *</label>
            <input
              id="form-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Đăng ký tư vấn miễn phí"
              required
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="form-desc">Mô tả</label>
            <input
              id="form-desc"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ngắn cho form này"
            />
          </div>

          {/* Fields */}
          <div className={styles.fieldsSection}>
            <div className={styles.fieldsHeader}>
              <span>Fields ({fields.length})</span>
              <IzButton type="button" variant="outline" onClick={addField}>+ Thêm field</IzButton>
            </div>

            {fields.map(field => (
              <div key={field.id} className={styles.fieldRow}>
                <input
                  type="text"
                  value={field.label}
                  onChange={e => updateField(field.id, { label: e.target.value })}
                  placeholder="Label"
                  className={styles.fieldLabel}
                />
                <select
                  value={field.type}
                  onChange={e => updateField(field.id, { type: e.target.value as FieldType })}
                  className={styles.fieldType}
                >
                  {FIELD_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <label className={styles.requiredToggle}>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={e => updateField(field.id, { required: e.target.checked })}
                  />
                  Bắt buộc
                </label>
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className={styles.removeField}
                  disabled={fields.length <= 1}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.modalFooter}>
            <IzButton type="button" variant="outline" onClick={onClose}>Huỷ</IzButton>
            <IzButton type="submit" disabled={loading || !name}>
              {loading ? 'Đang tạo...' : 'Tạo Form'}
            </IzButton>
          </div>
        </form>
      </div>
    </div>
  );
}
