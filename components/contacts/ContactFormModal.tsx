'use client';

import { useState } from 'react';
import type { Contact } from '@/core/schema/entities';
import styles from './contacts.module.scss';

interface Props {
  contact: Contact | null;       // null = create mode, Contact = edit mode
  onClose: () => void;
  onCreated: (c: Contact) => void;
  onUpdated: (c: Contact) => void;
}

export default function ContactFormModal({ contact, onClose, onCreated, onUpdated }: Props) {
  const isEdit = contact !== null;
  const [form, setForm] = useState({
    name: contact?.name ?? '',
    email: contact?.email ?? '',
    phone: contact?.phone ?? '',
    title: contact?.title ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      title: form.title.trim() || undefined,
    };

    try {
      const url = isEdit ? `/api/v1/contacts/${contact.id}` : '/api/v1/contacts';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Request failed');
      isEdit ? onUpdated(json.data) : onCreated(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Edit Contact' : 'New Contact'}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label className="form-label">
            Name *
            <input className="form-control" value={form.name} onChange={set('name')} placeholder="Full name" autoFocus required />
          </label>
          <label className="form-label">
            Email
            <input className="form-control" type="email" value={form.email} onChange={set('email')} placeholder="email@company.com" />
          </label>
          <div className={styles.formRow}>
            <label className="form-label" style={{ flex: 1 }}>
              Phone
              <input className="form-control" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
            </label>
            <label className="form-label" style={{ flex: 1 }}>
              Title
              <input className="form-control" value={form.title} onChange={set('title')} placeholder="CEO, Engineer…" />
            </label>
          </div>

          {error && <p className={styles.modalError}>{error}</p>}

          <div className={styles.modalActions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
