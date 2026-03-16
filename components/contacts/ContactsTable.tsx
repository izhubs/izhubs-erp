'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Contact } from '@/core/schema/entities';
import ContactFormModal from './ContactFormModal';
import styles from './contacts.module.scss';

interface Props {
  initialContacts: Contact[];
}

export default function ContactsTable({ initialContacts }: Props) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.title?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const handleCreated = useCallback((contact: Contact) => {
    setContacts(prev => [contact, ...prev]);
    setShowModal(false);
    setEditContact(null);
  }, []);

  const handleUpdated = useCallback((updated: Contact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditContact(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search contacts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.toolbarRight}>
          <span className={styles.count}>{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Contact
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Title</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  {search ? 'No contacts match your search.' : 'No contacts yet. Add your first contact!'}
                </td>
              </tr>
            ) : (
              filtered.map(contact => (
                <tr key={contact.id} className={styles.row}>
                  <td>
                    <div className={styles.nameCell}>
                      <span className={styles.avatar} style={{ background: avatarColor(contact.name) }}>
                        {initials(contact.name)}
                      </span>
                      <span className={styles.namePrimary}>{contact.name}</span>
                    </div>
                  </td>
                  <td className={styles.muted}>{contact.email ?? '—'}</td>
                  <td className={styles.muted}>{contact.phone ?? '—'}</td>
                  <td className={styles.muted}>{contact.title ?? '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => setEditContact(contact)}
                        title="Edit"
                      >✎</button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDelete(contact.id)}
                        disabled={deletingId === contact.id}
                        title="Delete"
                      >✕</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {(showModal || editContact) && (
        <ContactFormModal
          contact={editContact}
          onClose={() => { setShowModal(false); setEditContact(null); }}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899'];
function avatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xfffffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
