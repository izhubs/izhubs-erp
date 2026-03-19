'use client';

import * as React from 'react';
import { SheetView, EditableCell } from '@/components/ui/SmartGrid';
import { useContacts, useUpdateContact, useBulkDeleteContacts } from '@/hooks/useContacts';
import { useCreateContact } from '@/hooks/useContacts';
import { ColumnDef } from '@tanstack/react-table';
import ContactFormModal from '@/components/contacts/ContactFormModal';
import Link from 'next/link';
import type { Contact } from '@/core/schema/entities';

const columns: ColumnDef<Contact, any>[] = [
  { id: 'name',  accessorKey: 'name',  header: 'Họ tên',         cell: (ctx) => <EditableCell context={ctx} />, size: 200 },
  { id: 'email', accessorKey: 'email', header: 'Email',           cell: (ctx) => <EditableCell context={ctx} />, size: 220 },
  { id: 'phone', accessorKey: 'phone', header: 'Số điện thoại',  cell: (ctx) => <EditableCell context={ctx} />, size: 150 },
  { id: 'title', accessorKey: 'title', header: 'Chức danh',      cell: (ctx) => <EditableCell context={ctx} />, size: 180 },
  { id: 'status',accessorKey: 'status',header: 'Trạng thái',     cell: (ctx) => <EditableCell context={ctx} />, size: 120 },
];

export default function ContactsSheetPage() {
  const [showModal, setShowModal] = React.useState(false);
  const { data: page, isLoading } = useContacts({ pageSize: 200 });
  const updateMutation = useUpdateContact();
  const bulkDeleteMutation = useBulkDeleteContacts();

  const contacts = page?.data ?? [];

  const handleUpdateData = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      const contact = contacts[rowIndex];
      if (!contact || contact[columnId as keyof Contact] === value) return;
      updateMutation.mutate({ id: contact.id, [columnId]: value });
    },
    [contacts, updateMutation]
  );

  const handleDeleteRows = (ids: string[]) => {
    bulkDeleteMutation.mutate(ids);
  };

  return (
    <>
      <SheetView
        title="Contacts"
        columns={columns}
        data={contacts}
        isLoading={isLoading}
        onUpdateData={handleUpdateData}
        onAddRow={() => setShowModal(true)}
        onDeleteRows={handleDeleteRows}
        toolbarExtra={
          <Link href="/contacts" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
            ← Danh sách
          </Link>
        }
      />

      {showModal && (
        <ContactFormModal
          contact={null}
          onClose={() => setShowModal(false)}
          onCreated={() => setShowModal(false)}
          onUpdated={() => setShowModal(false)}
        />
      )}
    </>
  );
}
