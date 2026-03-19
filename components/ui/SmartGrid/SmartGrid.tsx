'use client';

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  RowSelectionState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import styles from './SmartGrid.module.scss';
import { cn, getColumnLetter } from './utils';
import { useGridKeyboard } from './useGridKeyboard';

interface SmartGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
}

export function SmartGrid<TData>({
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  updateData,
}: SmartGridProps<TData>) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const { activeCell, setActiveCell, isEditing, setIsEditing, handleKeyDown } =
    useGridKeyboard(data.length, columns.length);

  const isSelectionEnabled = onRowSelectionChange !== undefined || rowSelection !== undefined;

  const finalColumns = React.useMemo(() => {
    if (!isSelectionEnabled) return columns;

    const selectionCol: ColumnDef<TData, any> = {
      id: '_select',
      size: 40,
      header: ({ table }) => (
        <input
          type="checkbox"
          style={{ cursor: 'pointer' }}
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          style={{ cursor: 'pointer' }}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    };
    return [selectionCol, ...columns];
  }, [columns, isSelectionEnabled]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      rowSelection,
    },
    enableRowSelection: isSelectionEnabled,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData,
      activeCell,
      setActiveCell,
      isEditing,
      setIsEditing,
    },
  });

  const { rows } = table.getRowModel();

  const handleCopy = (e: React.ClipboardEvent) => {
    if (isEditing) return;
    
    // Copy TSV of selected rows if any
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length > 0) {
      e.preventDefault();
      const headers = table.getVisibleLeafColumns().filter(c => c.id !== '_select').map(c => c.id).join('\t');
      const rowStrings = selectedRows.map(row => {
        return row.getVisibleCells().filter(c => c.column.id !== '_select').map(c => String(c.getValue() || '')).join('\t');
      });
      e.clipboardData.setData('text/plain', [headers, ...rowStrings].join('\n'));
      return;
    }

    // Otherwise copy active cell
    if (activeCell) {
      e.preventDefault();
      const row = rows[activeCell.row];
      const cell = row?.getVisibleCells()[activeCell.col];
      if (cell) {
        e.clipboardData.setData('text/plain', String(cell.getValue() || ''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (isEditing || !updateData || !activeCell) return;
    e.preventDefault();

    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    // VERY basic paste starting from active cell
    // Handling multi-cell paste (e.g. pasting 2x2 cells)
    const pasteRows = text.split('\n').map(row => row.split('\t'));
    const startRow = activeCell.row;
    const startCol = activeCell.col;
    const visibleCols = table.getVisibleLeafColumns();

    pasteRows.forEach((rowData, rIdx) => {
      const targetRowIndex = startRow + rIdx;
      if (targetRowIndex >= data.length) return; // Ignore if beyond row bounds

      rowData.forEach((cellData, cIdx) => {
        const targetColIndex = startCol + cIdx;
        if (targetColIndex >= visibleCols.length) return; // Ignore if beyond col bounds
        
        const columnId = visibleCols[targetColIndex].id;
        if (columnId === '_select') return; // Cannot paste into selection column

        // Optimistically trigger updateData for each pasted cell
        updateData(targetRowIndex, columnId, cellData.trim());
      });
    });
  };

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 25,
    overscan: 10,
  });

  return (
    <div
      ref={tableContainerRef}
      className={styles.gridContainer}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onCopy={handleCopy}
      onPaste={handlePaste}
      style={{ outline: 'none' }} // Remove browser default focus outline
    >
      <table className={styles.table}>
        <thead className={styles.thead}>
          {/* A, B, C... Chrome Header Row */}
          <tr className={styles.tr}>
            <th className={cn(styles.th, styles.frozenColumn)} style={{ width: 40 }}>
            </th>
            {table.getVisibleLeafColumns().map((column, colIndex) => (
              <th
                key={`chrome-${column.id}`}
                className={styles.th}
                style={{ width: column.getSize() }}
              >
                {getColumnLetter(colIndex)}
              </th>
            ))}
          </tr>

          {/* Actual Column Headers */}
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.tr}>
              <th className={cn(styles.th, styles.frozenColumn)} style={{ width: 40 }}>
              </th>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    className={styles.th}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody
          className={styles.tbody}
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isSelected = row.getIsSelected();

            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={cn(styles.tr, isSelected && styles.selectedRow)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <td className={cn(styles.td, styles.frozenColumn)} style={{ width: 40 }}>
                  {virtualRow.index + 1}
                </td>

                {row.getVisibleCells().map((cell, colIndex) => {
                  const isActive = activeCell?.row === virtualRow.index && activeCell?.col === colIndex;

                  return (
                    <td
                      key={cell.id}
                      className={cn(
                        styles.td,
                        isActive && styles.activeCell,
                        isActive && isEditing ? "p-0" : "" // smaller padding when editing to fit input
                      )}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
