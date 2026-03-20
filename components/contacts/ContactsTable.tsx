'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

import type { Contact } from '@/core/schema/entities';
import ContactFormModal from './ContactFormModal';
import ContactSlideOver from './ContactSlideOver';
import StatusTabs from './StatusTabs';
import ContactFilterBar from './ContactFilterBar';
import Pagination from '@/components/shared/Pagination';
import { apiFetch } from '@/lib/apiFetch';
import { useToast } from '@/hooks/use-toast';

import { IzTable } from '@/components/ui/IzTable';
import { IzAvatar, IzAvatarFallback } from '@/components/ui/IzAvatar';
import { IzBadge, IzBadgeVariant } from '@/components/ui/IzBadge';
import {
  IzDropdownMenu,
  IzDropdownMenuTrigger,
  IzDropdownMenuContent,
  IzDropdownMenuItem,
  IzDropdownMenuSeparator,
} from '@/components/ui/IzDropdownMenu';

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

  const { toast } = useToast();

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
    toast({ title: 'Thành công', description: 'Đã tạo liên hệ mới.' });
  }, [toast]);

  const handleUpdated = useCallback((updated: Contact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditContact(null);
    setSelectedContact(prev => prev?.id === updated.id ? updated : prev);
    toast({ title: 'Cập nhật', description: 'Đã lưu thay đổi liên hệ.' });
  }, [toast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    setDeletingId(id);
    const res = await fetch(`/api/v1/contacts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setContacts(prev => prev.filter(c => c.id !== id));
      if (selectedContact?.id === id) setSelectedContact(null);
      import('@/hooks/use-toast').then(({ izToast }) => izToast({ title: 'Đã xoá', description: 'Liên hệ đã được xoá thành công.', variant: 'destructive' }));
    } else {
      toast({ title: 'Lỗi', description: 'Không thể xoá liên hệ', variant: 'destructive' });
    }
    setDeletingId(null);
  }, [selectedContact, toast]);

  const columnHelper = createColumnHelper<Contact>();
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => {
        const contact = info.row.original;
        const color = avatarColor(contact.name);
        return (
          <div className={styles.nameCell} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <IzAvatar size="sm">
              <IzAvatarFallback style={{ background: color, color: '#fff', fontSize: 'var(--font-size-xs)' }}>
                {initials(contact.name)}
              </IzAvatarFallback>
            </IzAvatar>
            <span className={styles.namePrimary} style={{ fontWeight: 600 }}>{contact.name}</span>
          </div>
        );
      }
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => <span className={styles.muted} style={{ color: 'var(--color-text-muted)' }}>{info.getValue() || '—'}</span>,
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: info => <span className={styles.muted} style={{ color: 'var(--color-text-muted)' }}>{info.getValue() || '—'}</span>,
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => <span className={styles.muted} style={{ color: 'var(--color-text-muted)' }}>{info.getValue() || '—'}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const val = info.getValue() || 'lead';
        const variantMap: Record<string, IzBadgeVariant> = {
          lead: 'secondary',
          active: 'success',
          churned: 'destructive',
          negotiation: 'warning',
        };
        const variant = variantMap[val] || 'default';
        return <IzBadge variant={variant} dot>{val.toUpperCase()}</IzBadge>;
      }
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => {
        const contact = info.row.original;
        return (
          <div className={styles.actions} onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
            <IzDropdownMenu>
              <IzDropdownMenuTrigger asChild>
                <button className={styles.actionBtn} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', opacity: 0.6 }}>
                  <MoreHorizontal size={18} />
                </button>
              </IzDropdownMenuTrigger>
              <IzDropdownMenuContent align="end">
                <IzDropdownMenuItem onClick={() => setEditContact(contact)}>
                  <Edit size={14} className="mr-2" style={{ marginRight: '8px' }} /> Edit
                </IzDropdownMenuItem>
                <IzDropdownMenuSeparator />
                <IzDropdownMenuItem 
                  variant="destructive" 
                  onClick={() => handleDelete(contact.id)}
                  disabled={deletingId === contact.id}
                >
                  <Trash2 size={14} className="mr-2" style={{ marginRight: '8px' }} /> Delete
                </IzDropdownMenuItem>
              </IzDropdownMenuContent>
            </IzDropdownMenu>
          </div>
        );
      }
    }),
  ], [setEditContact, handleDelete, deletingId]);

  const table = useReactTable({
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={styles.container}>
      <StatusTabs active={activeTab} counts={statusCounts} onChange={handleTabChange} />
      <ContactFilterBar search={search} onSearch={setSearch} total={meta.total} loading={loading} onAdd={() => setShowModal(true)} />

      <div className={styles.tableWrap} style={{ marginTop: 'var(--space-4)' }}>
        <IzTable 
          table={table} 
          isLoading={loading && contacts.length === 0}
          isEmpty={contacts.length === 0 && !loading}
          onRowClick={(row) => setSelectedContact(row)}
        />
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
