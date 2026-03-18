'use client';

import { useState, useEffect } from 'react';
import type { Contact } from '@/core/schema/entities';
import { apiFetch } from '@/lib/apiFetch';
import NotesList from '@/components/shared/NotesList';

interface Props {
  contact: Contact;
  onClose: () => void;
  onUpdated?: (contact: Contact) => void;
  onDeleted?: (id: string) => void;
}

export default function ContactSlideOver({ contact, onClose, onUpdated, onDeleted }: Props) {
  const [form, setForm] = useState({
    name: contact.name,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    title: contact.title ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form when selected contact changes (clicking different rows)
  useEffect(() => {
    setForm({
      name: contact.name,
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      title: contact.title ?? '',
    });
    setError(null);
  }, [contact.id, contact.name, contact.email, contact.phone, contact.title]);

  const hasChanges =
    form.name !== contact.name ||
    form.email !== (contact.email ?? '') ||
    form.phone !== (contact.phone ?? '') ||
    form.title !== (contact.title ?? '');

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/v1/contacts/${contact.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          title: form.title.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update contact');
      onUpdated?.(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/v1/contacts/${contact.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete contact');
      onDeleted?.(contact.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setLoading(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      <div className="slideover-overlay" onClick={onClose} />
      <aside className="slideover" aria-label="Contact details">
        <div className="slideover__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
            <span style={{
              width: 40, height: 40, borderRadius: '50%',
              background: avatarColor(contact.name),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initials(contact.name)}
            </span>
            <input
              className="slideover__title-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contact name"
              aria-label="Contact name"
            />
          </div>
          <button className="slideover__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="slideover__body">
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div className="slideover__field">
            <span className="slideover__label">Email</span>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <div className="slideover__field">
            <span className="slideover__label">Phone</span>
            <input
              type="tel"
              className="form-control"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+84 ..."
            />
          </div>

          <div className="slideover__field">
            <span className="slideover__label">Title / Role</span>
            <input
              className="form-control"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. CEO, Marketing Manager"
            />
          </div>

          <div className="slideover__field tooltip-wrapper" title="Coming soon">
            <span className="slideover__label">Company</span>
            <input className="form-control" placeholder="Link company..." disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div className="slideover__field tooltip-wrapper" title="Coming soon">
            <span className="slideover__label">Owner</span>
            <input className="form-control" value="@me" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div className="slideover__divider" />

          {/* Metadata */}
          <div className="slideover__field">
            <span className="slideover__label">Created</span>
            <span className="slideover__value">{new Date(contact.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="slideover__field">
            <span className="slideover__label">Updated</span>
            <span className="slideover__value">{new Date(contact.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Notes section — powered by C1 Notes System */}
          <div className="slideover__divider" />
          <NotesList entityType="contact" entityId={contact.id} />
        </div>

        <div className="slideover__footer" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <button className="btn btn-ghost" style={{ color: 'var(--color-danger)' }} onClick={handleDelete} disabled={loading}>
            Delete
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!hasChanges || loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{__html: `
        .slideover__title-input {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-text);
          border: 1px solid transparent;
          background: transparent;
          border-radius: var(--radius-sm);
          padding: 4px 8px;
          margin-left: -8px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .slideover__title-input:hover, .slideover__title-input:focus {
          border-color: var(--color-border);
          background: var(--color-bg-surface);
        }
        .slideover__divider {
          height: 1px;
          background: var(--color-border);
          margin: 24px 0;
        }
        .tooltip-wrapper {
          position: relative;
        }
      `}} />
    </>
  );
}

// ---- Helpers ----

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899'];
function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xfffffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
