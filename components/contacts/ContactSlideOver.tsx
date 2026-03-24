'use client';

import { useState, useEffect } from 'react';
import type { Contact } from '@/core/schema/entities';
import { apiFetch } from '@/lib/apiFetch';
import NotesList from '@/components/shared/NotesList';
import { IzSheet, IzSheetContent, IzSheetHeader, IzSheetBody, IzSheetFooter, IzSheetTitle } from '@izerp-theme/components/ui/IzSheet';
import { IzInput } from '@izerp-theme/components/ui/IzInput';
import { IzButton } from '@izerp-theme/components/ui/IzButton';

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
    <IzSheet open={true} onOpenChange={(o) => !o && onClose()}>
      <IzSheetContent size="md">
        <IzSheetHeader style={{ paddingBottom: 0 }}>
          <IzSheetTitle style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
            <span style={{
              width: 40, height: 40, borderRadius: '50%',
              background: avatarColor(contact.name),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initials(contact.name)}
            </span>
            <IzInput
              wrapperClassName="slideover-title-wrapper"
              className="slideover-title-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contact name"
              aria-label="Contact name"
            />
          </IzSheetTitle>
        </IzSheetHeader>

        <IzSheetBody>
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

          <div className="slideover-row">
            <span className="slideover-label">Email</span>
            <IzInput
              wrapperClassName="slideover-input-wrapper"
              className="slideover-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <div className="slideover-row">
            <span className="slideover-label">Phone</span>
            <IzInput
              wrapperClassName="slideover-input-wrapper"
              className="slideover-input"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+84 ..."
            />
          </div>

          <div className="slideover-row">
            <span className="slideover-label">Title / Role</span>
            <IzInput
              wrapperClassName="slideover-input-wrapper"
              className="slideover-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. CEO, Marketing Manager"
            />
          </div>

          <div className="slideover-row tooltip-wrapper" title="Coming soon">
            <span className="slideover-label">Company</span>
            <IzInput wrapperClassName="slideover-input-wrapper" className="slideover-input" placeholder="Link company..." disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div className="slideover-row tooltip-wrapper" title="Coming soon">
            <span className="slideover-label">Owner</span>
            <IzInput wrapperClassName="slideover-input-wrapper" className="slideover-input" value="@me" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>

          <div className="slideover-divider" />

          {/* Metadata Info Box */}
          <div style={{
            marginTop: '8px',
            padding: '12px 16px',
            background: 'var(--color-bg-hover)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--color-text-muted)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Created</span>
              <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Updated</span>
              <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                {new Date(contact.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Notes section — powered by C1 Notes System */}
          <div className="slideover-divider" />
          <NotesList entityType="contact" entityId={contact.id} />
        </IzSheetBody>

        <IzSheetFooter style={{ justifyContent: 'space-between' }}>
          <IzButton variant="ghost" className="text-danger hover:bg-danger/10 hover:text-danger" style={{ color: 'var(--color-danger)' }} onClick={handleDelete} disabled={loading}>
            Delete
          </IzButton>

          <div style={{ display: 'flex', gap: '8px' }}>
            <IzButton variant="ghost" onClick={onClose} disabled={loading}>Cancel</IzButton>
            <IzButton variant="default" onClick={handleSave} disabled={!hasChanges || loading} isLoading={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </IzButton>
          </div>
        </IzSheetFooter>
      </IzSheetContent>

      <style dangerouslySetInnerHTML={{__html: `
        .slideover-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .slideover-row:last-of-type {
          border-bottom: none;
        }
        .slideover-label {
          flex: 0 0 120px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-subtle, #64748b);
          margin-bottom: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .slideover-divider {
          height: 1px;
          background: var(--color-border);
          margin: 16px 0;
        }
        .slideover-input-wrapper {
          flex: 1;
        }
        .slideover-input {
          border-color: transparent !important;
          background-color: transparent !important;
          box-shadow: none !important;
          padding-left: 8px !important;
          padding-right: 0 !important;
          transition: background-color 0.2s !important;
          border-radius: var(--radius-sm) !important;
        }
        .slideover-input-wrapper:hover .slideover-input,
        .slideover-input:focus {
          background-color: var(--color-bg-hover) !important;
        }
        
        .slideover-title-wrapper {
          flex: 1;
        }
        .slideover-title-input {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          color: var(--color-text) !important;
          border-color: transparent !important;
          background: transparent !important;
          border-radius: var(--radius-sm) !important;
          padding: 4px 8px !important;
          box-shadow: none !important;
          transition: all 0.2s ease !important;
        }
        .slideover-title-wrapper:hover .slideover-title-input, 
        .slideover-title-input:focus {
          border-color: var(--color-border) !important;
          background: var(--color-bg-base) !important;
        }
      `}} />
    </IzSheet>
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
