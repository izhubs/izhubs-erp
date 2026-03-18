'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Contact } from '@/core/schema/entities';
import ContactFormModal from './ContactFormModal';
import ContactSlideOver from './ContactSlideOver';
import StatusTabs from './StatusTabs';
import ContactFilterBar from './ContactFilterBar';
import Pagination from '@/components/shared/Pagination';
import { apiFetch } from '@/lib/apiFetch';
import styles from './contacts.module.scss';

interface Props {
  initialContacts: Contact[];
  initialMeta?: { total: number; page: number; limit: number; totalPages: number };
  initialCounts?: Record<string, number>;
}

export default function ContactsTable({ initialContacts, initialMeta, initialCounts }: Props) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [meta, setMeta] = useState(initialMeta ?? { total: initialContacts.length, page: 1, limit: 25, totalPages: 1 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>(initialCounts ?? {});
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (activeTab !== 'all') params.set('status', activeTab);
    if (debouncedSearch) params.set('search', debouncedSearch);

    apiFetch(`/api/v1/contacts?${params}`)
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        setContacts(json.data ?? []);
        if (json.meta) setMeta(json.meta);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, activeTab, debouncedSearch]);

  const handleTabChange = useCallback((tab: string) => { setActiveTab(tab); setPage(1); }, []);

  const handleCreated = useCallback((contact: Contact) => {
    setContacts(prev => [contact, ...prev]);
    setShowModal(false);
    setStatusCounts(prev => ({ ...prev, all: (prev.all ?? 0) + 1, [contact.status ?? 'lead']: (prev[contact.status ?? 'lead'] ?? 0) + 1 }));
  }, []);

  const handleUpdated = useCallback((updated: Contact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditContact(null);
    setSelectedContact(prev => prev?.id === updated.id ? updated : prev);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    setDeletingId(id);
    const res = await fetch(`/api/v1/contacts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setContacts(prev => prev.filter(c => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
    }
    setDeletingId(null);
  }, [selectedContact]);

  return (
    <div className={styles.container}>
      <StatusTabs active={activeTab} counts={statusCounts} onChange={handleTabChange} />
      <ContactFilterBar search={search} onSearch={setSearch} total={meta.total} loading={loading} onAdd={() => setShowModal(true)} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Title</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr><td colSpan={6} className={styles.empty}>{loading ? 'Loading…' : 'No contacts match.'}</td></tr>
            ) : contacts.map(contact => (
              <tr
                key={contact.id}
                className={`${styles.row}${selectedContact?.id === contact.id ? ` ${styles.rowSelected}` : ''}`}
                onClick={() => setSelectedContact(contact)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div className={styles.nameCell}>
                    <span className={styles.avatar} style={{ background: avatarColor(contact.name) }}>{initials(contact.name)}</span>
                    <span className={styles.namePrimary}>{contact.name}</span>
                  </div>
                </td>
                <td className={styles.muted}>{contact.email ?? '—'}</td>
                <td className={styles.muted}>{contact.phone ?? '—'}</td>
                <td className={styles.muted}>{contact.title ?? '—'}</td>
                <td><span className={`${styles.statusBadge} ${styles[`status_${contact.status ?? 'lead'}`]}`}>{contact.status ?? 'lead'}</span></td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={e => { e.stopPropagation(); setEditContact(contact); }} title="Edit">✎</button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={e => { e.stopPropagation(); handleDelete(contact.id); }} disabled={deletingId === contact.id} title="Delete">✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={setPage} />

      {(showModal || editContact) && (
        <ContactFormModal contact={editContact} onClose={() => { setShowModal(false); setEditContact(null); }} onCreated={handleCreated} onUpdated={handleUpdated} />
      )}
      {selectedContact && (
        <ContactSlideOver contact={selectedContact} onClose={() => setSelectedContact(null)} onUpdated={handleUpdated} onDeleted={id => { setContacts(p => p.filter(c => c.id !== id)); setSelectedContact(null); }} />
      )}
    </div>
  );
}

function initials(n: string) { return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
const COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#f97316','#8b5cf6','#ec4899'];
function avatarColor(n: string) { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff; return COLORS[h % COLORS.length]; }
