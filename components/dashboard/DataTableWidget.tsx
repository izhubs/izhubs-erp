'use client';

import { useState } from 'react';

export interface ColumnDef {
  header: string;
  accessorKey: string;
  type?: 'text' | 'number' | 'currency' | 'status' | 'date';
}

export interface DataTableWidgetProps {
  id: string;
  title?: string;
  columns: ColumnDef[];
  data: any[];
  isLoading?: boolean;
}

export function DataTableWidget({
  title,
  columns,
  data,
  isLoading
}: DataTableWidgetProps) {
  if (isLoading) {
    return (
      <div className="card p-4 skeleton-container animate-pulse" style={{ height: '400px' }}>
        <div className="skeleton h-6 w-1/4 mb-4 rounded"></div>
        <div className="skeleton h-10 w-full mb-2 rounded"></div>
        <div className="skeleton h-10 w-full mb-2 rounded"></div>
        <div className="skeleton h-10 w-full rounded"></div>
      </div>
    );
  }

  const renderCell = (row: any, col: ColumnDef) => {
    const val = row[col.accessorKey];
    if (val === undefined || val === null) return '-';

    switch (col.type) {
      case 'currency':
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
      case 'date':
        return new Date(val).toLocaleDateString('vi-VN');
      case 'status':
        return (
          <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: 12,
            fontWeight: 500,
            background: 'var(--color-bg-hover)',
            color: 'var(--color-text)'
          }}>
            {val}
          </span>
        );
      default:
        return val;
    }
  };

  return (
    <div className="card" style={{ padding: 'var(--space-4)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text)' }}>
            {title}
          </h3>
        </div>
      )}
      
      <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
          <thead style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              {columns.map(col => (
                <th key={col.accessorKey} style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--color-text-muted)' }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, i) => (
                <tr key={row.id || i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {columns.map(col => (
                    <td key={col.accessorKey} style={{ padding: 'var(--space-3)', color: 'var(--color-text)' }}>
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>No data available</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
