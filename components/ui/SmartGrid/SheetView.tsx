'use client';

/**
 * SheetView — Generic spreadsheet-style editable grid page.
 *
 * Usage:
 *   <SheetView
 *     title="Contacts"
 *     columns={contactColumns}
 *     data={contacts}
 *     onUpdateData={handleUpdate}
 *     onAddRow={handleAdd}         // triggers when phantom bottom row is clicked
 *     onDeleteRows={handleDelete}
 *   />
 */

import * as React from 'react';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { SmartGrid } from './SmartGrid';
import { Trash2 } from 'lucide-react';

export interface SheetViewProps<TData extends Record<string, any>> {
  title: string;
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  onUpdateData: (rowIndex: number, columnId: string, value: unknown) => void;
  /** Triggered by the phantom bottom row click */
  onAddRow?: () => void;
  onDeleteRows?: (keys: string[]) => void;
  rowKey?: keyof TData;
  toolbarExtra?: React.ReactNode;
}

export function SheetView<TData extends Record<string, any>>({
  title,
  columns,
  data,
  isLoading,
  onUpdateData,
  onAddRow,
  onDeleteRows,
  rowKey = 'id',
  toolbarExtra,
}: SheetViewProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectedKeys = React.useMemo(() =>
    Object.keys(rowSelection).map(Number).filter(i => i < data.length).map(i => data[i][rowKey] as string),
    [rowSelection, data, rowKey]
  );

  const handleDeleteSelected = () => {
    if (!onDeleteRows || selectedKeys.length === 0) return;
    if (confirm(`Xóa ${selectedKeys.length} dòng đã chọn?`)) {
      onDeleteRows(selectedKeys);
      setRowSelection({});
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Compact toolbar ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',           // compact: was var(--space-3) var(--space-4)
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
        gap: 8,
        minHeight: 40,
      }}>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
          {title}
          {data.length > 0 && (
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 6 }}>
              {data.length} dòng
            </span>
          )}
        </span>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {selectedKeys.length > 0 && onDeleteRows && (
            <button
              className="btn btn-ghost"
              onClick={handleDeleteSelected}
              style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontSize: 13 }}
            >
              <Trash2 size={13} />
              Xóa {selectedKeys.length}
            </button>
          )}
          {toolbarExtra}
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>Đang tải…</div>
        ) : (
          <SmartGrid
            data={data}
            columns={columns}
            updateData={onUpdateData}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onAddRow={onAddRow}
          />
        )}
      </div>
    </div>
  );
}
