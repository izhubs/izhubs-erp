'use client';

/**
 * SheetView — Generic reusable spreadsheet-style grid page.
 *
 * Pass canCreate/canDelete based on the user's role/permissions.
 * The trailing empty row only appears when canCreate=true.
 * The bulk delete button only appears when canDelete=true.
 */

import * as React from 'react';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { SmartGrid } from './SmartGrid';
import { Trash2 } from 'lucide-react';

export interface SheetViewProps<TData = any> {
  title: string;
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  onUpdateData: (rowIndex: number, columnId: string, value: unknown) => void;
  /** Called when trailing empty row is committed. Requires canCreate=true to show. */
  onAddRow?: (draft: Record<string, unknown>) => void;
  onDeleteRows?: (keys: string[]) => void;
  rowKey?: string;
  toolbarExtra?: React.ReactNode;
  /** Show trailing draft row for creating new records (tie to 'create' permission) */
  canCreate?: boolean;
  /** Show bulk delete button (tie to 'delete' permission) */
  canDelete?: boolean;
  pinnedColumns?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SheetView<TData = any>({
  title,
  columns,
  data,
  isLoading,
  onUpdateData,
  onAddRow,
  onDeleteRows,
  rowKey = 'id',
  toolbarExtra,
  canCreate = false,
  canDelete = false,
  pinnedColumns,
}: SheetViewProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectedKeys = React.useMemo(() =>
    Object.keys(rowSelection)
      .map(Number)
      .filter(i => i < data.length)
      .map(i => (data[i] as Record<string, unknown>)[rowKey] as string),
    [rowSelection, data, rowKey],
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
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 12px', borderBottom: '1px solid var(--color-border)',
        flexShrink: 0, gap: 8, minHeight: 40,
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
          {canDelete && selectedKeys.length > 0 && onDeleteRows && (
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

      {/* ── Grid (SmartGrid handles virtual scroll + editing) ── */}
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
            onAddRow={canCreate ? onAddRow : undefined}
            pinnedColumns={pinnedColumns}
          />
        )}
      </div>
    </div>
  );
}
