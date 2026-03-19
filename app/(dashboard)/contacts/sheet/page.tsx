'use client';

import * as React from 'react';
import { SmartGrid, EditableCell } from '@/components/ui/SmartGrid';
import { useContacts, useUpdateContact, useBulkDeleteContacts } from '@/hooks/useContacts';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ContactsSheetPage() {
  const [rowSelection, setRowSelection] = useState({});
  const { data: contactsPage, isLoading } = useContacts({ pageSize: 100 });
  const updateMutation = useUpdateContact();
  const bulkDeleteMutation = useBulkDeleteContacts();

  const handleUpdateData = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      if (!contactsPage?.data) return;
      const contact = contactsPage.data[rowIndex];
      if (!contact) return;

      // Optimistically we could update local state, but TanStack Query's invalidate handles it quickly.
      // Usually you use `onMutate` in the hook for true optimistic UI, but for now we just fire mutation.
      if (contact[columnId as keyof typeof contact] !== value) {
        updateMutation.mutate({ id: contact.id, [columnId]: value });
      }
    },
    [contactsPage, updateMutation]
  );

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    return [
      { id: 'name', accessorKey: 'name', header: 'Họ tên', cell: (ctx) => <EditableCell context={ctx} />, size: 200 },
      { id: 'email', accessorKey: 'email', header: 'Email', cell: (ctx) => <EditableCell context={ctx} />, size: 220 },
      { id: 'phone', accessorKey: 'phone', header: 'Số điện thoại', cell: (ctx) => <EditableCell context={ctx} />, size: 150 },
      { id: 'title', accessorKey: 'title', header: 'Chức danh', cell: (ctx) => <EditableCell context={ctx} />, size: 180 },
      { id: 'status', accessorKey: 'status', header: 'Trạng thái', cell: (ctx) => <EditableCell context={ctx} />, size: 120 },
    ];
  }, []);

  const selectedIndexes = Object.keys(rowSelection).map(Number);
  const selectedIds = selectedIndexes.map(i => contactsPage?.data?.[i]?.id).filter(Boolean) as string[];

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Bạn có chắc muốn xóa ${selectedIds.length} liên hệ đã chọn?`)) {
      bulkDeleteMutation.mutate(selectedIds, {
        onSuccess: () => {
          setRowSelection({});
        }
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0, paddingBottom: 0, marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Contacts Sheet</h1>
        </div>
        <div>
          {selectedIds.length > 0 && (
            <button 
              className="btn btn-ghost" 
              onClick={handleDeleteSelected}
              style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <Trash2 size={16} /> Xóa {selectedIds.length} mục
            </button>
          )}
        </div>
      </div>
      
      <div style={{ flex: 1, overflow: 'hidden', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-4)' }}>Đang tải dữ liệu...</div>
        ) : contactsPage?.data ? (
          <SmartGrid
            data={contactsPage.data}
            columns={columns}
            updateData={handleUpdateData}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        ) : (
          <div style={{ padding: 'var(--space-4)' }}>Không có dữ liệu.</div>
        )}
      </div>
    </div>
  );
}
