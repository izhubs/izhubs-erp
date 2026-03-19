'use client';

import * as React from 'react';
import { SmartGrid, EditableCell } from '@/components/ui/SmartGrid';
import { useDeals, useUpdateDeal, useBulkDeleteDeals } from '@/hooks/useDeals';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DealsSheetPage() {
  const [rowSelection, setRowSelection] = useState({});
  // Fetch a large page for the sheet view, ideally we would use infinite query but this works for V1 testing
  const { data: dealsResponse, isLoading } = useDeals();
  const updateMutation = useUpdateDeal();
  const bulkDeleteMutation = useBulkDeleteDeals();

  const handleUpdateData = React.useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      if (!dealsResponse?.data) return;
      const deal = dealsResponse.data[rowIndex];
      if (!deal) return;

      if (deal[columnId as keyof typeof deal] !== value) {
        updateMutation.mutate({ id: deal.id, [columnId]: value });
      }
    },
    [dealsResponse, updateMutation]
  );

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    return [
      { id: 'name', accessorKey: 'name', header: 'Tên Deal', cell: (ctx) => <EditableCell context={ctx} />, size: 250 },
      { id: 'value', accessorKey: 'value', header: 'Giá trị (VNĐ)', cell: (ctx) => <EditableCell context={ctx} />, size: 150 },
      { id: 'stage', accessorKey: 'stage', header: 'Giai đoạn', cell: (ctx) => <EditableCell context={ctx} />, size: 150 },
    ];
  }, []);

  const selectedIndexes = Object.keys(rowSelection).map(Number);
  const selectedIds = selectedIndexes.map(i => dealsResponse?.data?.[i]?.id).filter(Boolean) as string[];

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Bạn có chắc muốn xóa ${selectedIds.length} deal đã chọn?`)) {
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
          <h1>Deals Sheet</h1>
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
        ) : dealsResponse?.data ? (
          <SmartGrid
            data={dealsResponse.data}
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
