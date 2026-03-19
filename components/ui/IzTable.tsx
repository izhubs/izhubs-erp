import React from 'react';
import {
  flexRender,
  Table as ReactTable,
} from '@tanstack/react-table';
import styles from './IzTable.module.scss';
import { IzSkeleton } from './IzSkeleton';
import { IzEmptyState } from './IzEmptyState';

export interface IzTableProps<TData> {
  table: ReactTable<TData>;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyProps?: {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  onRowClick?: (row: TData) => void;
  skeletonRows?: number;
}

const cx = (...args: any[]) => args.filter(Boolean).join(' ');

/**
 * IzTable: Bọc chuẩn Data Grid dành cho Izhubs ERP.
 * Hỗ trợ TanStack Table v8. Tự hiển thị khung xương Loading và Empty State.
 */
export function IzTable<TData>({
  table,
  isLoading = false,
  isEmpty = false,
  emptyProps,
  onRowClick,
  skeletonRows = 5,
}: IzTableProps<TData>) {
  
  if (isEmpty && !isLoading) {
    return (
      <div className={styles.emptyContainer}>
        <IzEmptyState
          title={emptyProps?.title || 'Chưa có dữ liệu'}
          description={emptyProps?.description || 'Hiện tại danh sách này đang trống. Hãy thêm bản ghi mới!'}
          actionLabel={emptyProps?.actionLabel}
          onAction={emptyProps?.onAction}
        />
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.tr}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cx(styles.th, header.column.getCanSort() && styles.sortable)}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className={cx(styles.headerContent, header.column.getCanSort() && styles.cursorPointer)}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <span className={styles.sortIndicator}>↑</span>,
                          desc: <span className={styles.sortIndicator}>↓</span>,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody className={styles.tbody}>
          {isLoading ? (
            /* Skeleton Loading Rows */
            Array.from({ length: skeletonRows }).map((_, index) => (
              <tr key={`skeleton-${index}`} className={styles.tr}>
                {table.getAllColumns().map((col, colIndex) => (
                  <td key={`skeleton-cell-${colIndex}`} className={styles.td}>
                    <IzSkeleton shape="text" />
                  </td>
                ))}
              </tr>
            ))
          ) : (
            /* Actual Data Rows */
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cx(styles.tr, row.getIsSelected() && styles.selected, onRowClick && styles.clickable)}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
