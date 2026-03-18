// =============================================================
// izhubs ERP — DataTable
// Generic sortable, clickable table wrapping .table CSS class.
// Supports row click (→ SidePanel), column sort, loading state.
//
// Usage:
//   <DataTable columns={[...]} rows={data} onRowClick={(row) => ...} />
// =============================================================

'use client';

import React, { useState } from 'react';
import EmptyState from './EmptyState';

export interface DataTableColumn<T> {
  /** Column key — maps to row[key] for sorting */
  key: keyof T | string;
  /** Column header label */
  label: string;
  /** Custom cell renderer — receives the row */
  render?: (row: T) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string;
  /** Disable sorting for this column */
  sortable?: boolean;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Key field used for React key prop */
  rowKey?: keyof T;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  /** Slots for empty state if rows.length === 0 */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Highlight rows matching this predicate (e.g. expiring contracts) */
  highlightRow?: (row: T) => 'warning' | 'danger' | null;
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading = false,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription,
  emptyAction,
  highlightRow,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const sorted = sort
    ? [...rows].sort((a, b) => {
        const av = a[sort.key] ?? '';
        const bv = b[sort.key] ?? '';
        const cmp = String(av).localeCompare(String(bv), 'vi');
        return sort.dir === 'asc' ? cmp : -cmp;
      })
    : rows;

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="skeleton" style={{ height: 40, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 40, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 40 }} />
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  const highlightStyle = (row: T): React.CSSProperties => {
    const hl = highlightRow?.(row);
    if (hl === 'danger')
      return { background: 'rgba(239,68,68,0.07)', borderLeft: '3px solid var(--color-danger)' };
    if (hl === 'warning')
      return { background: 'rgba(245,158,11,0.07)', borderLeft: '3px solid var(--color-warning)' };
    return {};
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{
                  width: col.width,
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                onClick={() => col.sortable !== false && toggleSort(String(col.key))}
              >
                {col.label}
                {sort?.key === String(col.key) && (
                  <span style={{ marginLeft: 4, fontSize: 10 }}>
                    {sort.dir === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr
              key={rowKey ? String(row[rowKey as string]) : idx}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                ...highlightStyle(row),
              }}
            >
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
