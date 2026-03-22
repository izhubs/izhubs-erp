'use client';

import { useState, useEffect, FormEvent } from 'react';
import styles from './PublicFormView.module.scss';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  name: string;
  description: string | null;
  fields: FormField[];
}

interface Props {
  formId: string;
}

export function PublicFormView({ formId }: Props) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsEmbed(searchParams.get('embed') === 'true');
    }
    
    (async () => {
      try {
        const res = await fetch(`/api/v1/public/forms/${formId}`);
        if (!res.ok) throw new Error('Form not found or inactive');
        const json = await res.json();
        setForm(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading form');
      } finally {
        setLoading(false);
      }
    })();
  }, [formId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/v1/public/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: values }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json?.error?.message || 'Submit failed');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (isEmbed) return <>{children}</>;
    return <div className={styles.standaloneWrapper}>{children}</div>;
  };

  if (loading) {
    return <Wrapper><div className={styles.card}><p className={styles.loading}>Loading form...</p></div></Wrapper>;
  }

  if (error) {
    return (
      <Wrapper>
        <div className={styles.card}>
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (submitted) {
    return (
      <Wrapper>
        <div className={styles.card}>
          <div className={styles.successState}>
            <span className={styles.successIcon}>🎉</span>
            <h2>Thank you!</h2>
            <p>Your response has been submitted successfully.</p>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (!form) return null;

  return (
    <Wrapper>
      <div className={`${styles.card} ${isEmbed ? styles.embedded : ''}`}>
        <div className={styles.header}>
        <h1 className={styles.title}>{form.name}</h1>
        {form.description && <p className={styles.description}>{form.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {form.fields.map(field => (
          <div key={field.id} className={styles.fieldGroup}>
            <label className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}> *</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                className={styles.input}
                required={field.required}
                rows={4}
                value={values[field.label] || ''}
                onChange={e => setValues(v => ({ ...v, [field.label]: e.target.value }))}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
              />
            ) : field.type === 'select' ? (
              <select
                className={styles.input}
                required={field.required}
                value={values[field.label] || ''}
                onChange={e => setValues(v => ({ ...v, [field.label]: e.target.value }))}
              >
                <option value="">Select an option</option>
                {(field.options || []).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                className={styles.input}
                type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'phone' ? 'tel' : 'text'}
                required={field.required}
                value={values[field.label] || ''}
                onChange={e => setValues(v => ({ ...v, [field.label]: e.target.value }))}
                placeholder={
                  field.type === 'email' ? 'you@example.com'
                  : field.type === 'phone' ? '+84 912 345 678'
                  : field.type === 'number' ? '0'
                  : `Enter ${field.label.toLowerCase()}...`
                }
              />
            )}
          </div>
        ))}

        {error && <p className={styles.errorMsg}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

        <div className={styles.footer}>
          <span>Powered by <strong>izhubs ERP</strong></span>
        </div>
      </div>
    </Wrapper>
  );
}
