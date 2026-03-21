'use client';

import { useState } from 'react';
import styles from './IzFormList.module.scss';
import { IzButton } from '@/components/ui/IzButton';
import { IzModal } from '@/components/ui/IzModal';
import { CreateFormModal } from './CreateFormModal';
import { FormCard } from './FormCard';

interface IzFormData {
  id: string;
  name: string;
  description: string | null;
  fields: { id: string; type: string; label: string; required: boolean }[];
  isActive: boolean;
  createdAt: string;
}

interface Props {
  initialForms: IzFormData[];
}

export function IzFormListClient({ initialForms }: Props) {
  const [forms, setForms] = useState<IzFormData[]>(initialForms);
  const [showCreate, setShowCreate] = useState(false);

  const handleCreated = (newForm: IzFormData) => {
    setForms(prev => [newForm, ...prev]);
    setShowCreate(false);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📋 izForm</h1>
          <p className={styles.subtitle}>
            {forms.length} form{forms.length !== 1 ? 's' : ''} — Tạo, nhúng và thu thập lead từ website của bạn
          </p>
        </div>
        <IzButton onClick={() => setShowCreate(true)} id="izform-create-btn">
          + Tạo Form
        </IzButton>
      </div>

      {/* Form Grid */}
      {forms.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>Chưa có form nào</h3>
          <p>Tạo form đầu tiên để bắt đầu thu thập lead từ website của bạn.</p>
          <IzButton onClick={() => setShowCreate(true)}>Tạo Form đầu tiên</IzButton>
        </div>
      ) : (
        <div className={styles.grid}>
          {forms.map(form => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateFormModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
