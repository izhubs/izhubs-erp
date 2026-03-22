'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IzButton } from '@/components/ui/IzButton';
import { IzCard, IzCardContent } from '@/components/ui/IzCard';
import { ArrowLeft, Edit, Copy, Check, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/userTime';
import styles from './IzFormDetail.module.scss';

interface Submission {
  id: string;
  data: Record<string, unknown>;
  contactId: string | null;
  submittedAt: string;
}

interface FormData {
  id: string;
  name: string;
  description: string | null;
  fields: { id: string; type: string; label: string; required: boolean; options?: string[] }[];
  isActive: boolean;
  webhookUrl?: string;
  autoConvertLead?: boolean;
  createdAt: string;
}

interface Props {
  formId: string;
}

export function IzFormDetail({ formId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [formRes, subRes] = await Promise.all([
          fetch(`/api/v1/plugins/izform/forms/${formId}`),
          fetch(`/api/v1/plugins/izform/forms/${formId}/submissions`),
        ]);
        const formJson = await formRes.json();
        const subJson = await subRes.json();

        if (!formRes.ok) throw new Error(formJson?.error?.message || 'Form not found');
        setForm(formJson.data);
        setSubmissions(subJson.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading form');
      } finally {
        setLoading(false);
      }
    })();
  }, [formId]);

  const embedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${formId}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="500" frameborder="0" style="border:none;"></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(iframeCode).then(() => {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>Loading form...</div>
    );
  }

  if (error || !form) {
    return (
      <div className={styles.error}>
        <p>{error || 'Form not found'}</p>
        <IzButton onClick={() => router.push('/plugins/izform')}>
          <ArrowLeft size={16} /> Back to Forms
        </IzButton>
      </div>
    );
  }

  // Extract unique column labels from all submissions
  const columnLabels = form.fields.map(f => f.label);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <IzButton variant="ghost" size="icon" onClick={() => router.push('/plugins/izform')}>
            <ArrowLeft size={18} />
          </IzButton>
          <div>
            <h1 className={styles.title}>{form.name}</h1>
            {form.description && <p className={styles.subtitle}>{form.description}</p>}
          </div>
        </div>
        <div className={styles.headerActions}>
          <a href={`/forms/${formId}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <IzButton variant="outline">
              <ExternalLink size={14} /> View Live
            </IzButton>
          </a>
          <IzButton variant="outline" onClick={() => router.push(`/plugins/izform/${formId}/edit`)}>
            <Edit size={14} /> Edit
          </IzButton>
        </div>
      </div>

      {/* Stats cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{submissions.length}</span>
          <span className={styles.statLabel}>Submissions</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{form.fields.length}</span>
          <span className={styles.statLabel}>Fields</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{form.isActive ? '✅' : '⏸'}</span>
          <span className={styles.statLabel}>{form.isActive ? 'Active' : 'Inactive'}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{form.autoConvertLead ? '🔗' : '—'}</span>
          <span className={styles.statLabel}>Lead Routing</span>
        </div>
      </div>

      {/* Embed Code */}
      <IzCard>
        <IzCardContent>
          <div className={styles.embedRow}>
            <div className={styles.embedLabel}>
              <ExternalLink size={14} /> Embed Code
            </div>
            <code className={styles.embedCode}>{iframeCode}</code>
            <IzButton variant="outline" onClick={copyEmbed}>
              {copiedEmbed ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </IzButton>
          </div>
        </IzCardContent>
      </IzCard>

      {/* Submissions Table */}
      <IzCard>
        <IzCardContent>
          <div className={styles.sectionTitle}>Submissions ({submissions.length})</div>

          {submissions.length === 0 ? (
            <div className={styles.emptySubmissions}>
              <p>Chưa có submission nào. Chia sẻ form link hoặc nhúng embed code để bắt đầu thu thập data.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    {columnLabels.map(label => (
                      <th key={label}>{label}</th>
                    ))}
                    <th>Contact</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => (
                    <tr key={sub.id}>
                      <td className={styles.rowNum}>{i + 1}</td>
                      {columnLabels.map(label => (
                        <td key={label}>{String(sub.data[label] ?? '—')}</td>
                      ))}
                      <td>{sub.contactId ? '🔗' : '—'}</td>
                      <td className={styles.dateCell}>{formatDate(sub.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </IzCardContent>
      </IzCard>
    </div>
  );
}
