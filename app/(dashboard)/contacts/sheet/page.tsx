'use client';

import * as React from 'react';
import { SheetView, EditableCell } from '@izerp-theme/components/ui/SmartGrid';
import { useContacts, useUpdateContact, useBulkDeleteContacts, useCreateContact } from '@/hooks/useContacts';
import { useSheetPermissions } from '@/hooks/useSheetPermissions';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import type { Contact } from '@/core/schema/entities';

const columns: ColumnDef<Contact, any>[] = [
  { id: 'name',  accessorKey: 'name',  header: 'Họ tên',        cell: (ctx) => <EditableCell context={ctx} />, size: 200 },
  { id: 'email', accessorKey: 'email', header: 'Email',          cell: (ctx) => <EditableCell context={ctx} />, size: 220 },
  { id: 'phone', accessorKey: 'phone', header: 'Số điện thoại', cell: (ctx) => <EditableCell context={ctx} />, size: 150 },
  { id: 'title', accessorKey: 'title', header: 'Chức danh',     cell: (ctx) => <EditableCell context={ctx} />, size: 180 },
  { id: 'status',accessorKey: 'status',header: 'Trạng thái',    cell: (ctx) => <EditableCell context={ctx} />, size: 120,
    meta: {
      type: 'select',
      options: [
        { label: 'Lead', value: 'lead' },
        { label: 'Customer', value: 'customer' },
        { label: 'Prospect', value: 'prospect' },
        { label: 'Churned', value: 'churned' },
      ],
    }
  },
];

export default function ContactsSheetPage() {
  const { data: page, isLoading } = useContacts({ pageSize: 200 });
  const updateMutation  = useUpdateContact();
  const createMutation  = useCreateContact();
  const deleteMutation  = useBulkDeleteContacts();
  const { canCreate, canDelete } = useSheetPermissions();

  const contacts = (page?.data ?? []) as unknown as any[];

  const handleUpdateData = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      const contact = contacts[rowIndex];
      if (!contact || contact[columnId] === value) return;
      updateMutation.mutate({ id: contact.id, [columnId]: value });
    },
    [contacts, updateMutation],
  );

  const handleAddRow = React.useCallback(
    (draft: Record<string, unknown>) => {
      if (!draft.name) return;
      createMutation.mutate(draft as any);
    },
    [createMutation],
  );

  return (
    <div className="page--sheet">
      <SheetView
        title="Contacts"
        columns={columns as any}
        data={contacts}
        isLoading={isLoading}
        onUpdateData={handleUpdateData}
        onAddRow={handleAddRow}
        onDeleteRows={(ids) => deleteMutation.mutate(ids)}
        canCreate={canCreate}
        canDelete={canDelete}
        pinnedColumns={['name']}
        toolbarExtra={
          <Link href="/contacts" className="btn btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}>
            ← Danh sách
          </Link>
        }
      />
    </div>
  );
}
