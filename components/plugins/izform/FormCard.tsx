'use client';

import { useState } from 'react';
import styles from './IzFormList.module.scss';
import { IzButton } from '@/components/ui/IzButton';
import { formatDate } from '@/lib/userTime';

interface FormField {
  id: string;
  type: string;
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
  form: FormData;
}

export function FormCard({ form }: Props) {
  const [copied, setCopied] = useState(false);

  const embedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${form.id}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="500" frameborder="0" style="border:none;"></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(iframeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`${styles.formCard} ${!form.isActive ? styles.formCardInactive : ''}`}>
      <div className={styles.formCardHeader}>
        <div>
          <h3 className={styles.formCardName}>{form.name}</h3>
          {form.description && <p className={styles.formCardDesc}>{form.description}</p>}
        </div>
        <span className={form.isActive ? styles.activeBadge : styles.inactiveBadge}>
          {form.isActive ? '✅ Active' : '⏸ Inactive'}
        </span>
      </div>

      <div className={styles.formCardMeta}>
        <span>{form.fields.length} fields</span>
        <span>·</span>
        <span>{formatDate(form.createdAt)}</span>
      </div>

      <div className={styles.embedSection}>
        <div className={styles.embedCode}>
          <code>{iframeCode.substring(0, 60)}...</code>
        </div>
        <IzButton
          variant="outline"
          onClick={copyEmbed}
          className={styles.copyBtn}
          id={`copy-embed-${form.id}`}
        >
          {copied ? '✅ Đã copy' : '📋 Copy Embed'}
        </IzButton>
      </div>

      <div className={styles.formCardActions}>
        <a href={`/forms/${form.id}`} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
          👁️ View Live
        </a>
        <a href={`/plugins/izform/${form.id}/edit`} className={styles.viewLink}>
          ✏️ Edit
        </a>
        <a href={`/plugins/izform/${form.id}`} className={styles.viewLink}>
          View submissions →
        </a>
      </div>
    </div>
  );
}
