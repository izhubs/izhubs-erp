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
  onAddRow?: () => void;
}

export function SmartGrid<TData>({
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  updateData,
  onAddRow,
}: SmartGridProps<TData>) {
  // Two separate refs:
  // scrollRef  → the vertically scrolling body (rows)
  // headerRef  → the horizontally-synced fixed header
  const scrollRef    = React.useRef<HTMLDivElement>(null);
  const headerRef    = React.useRef<HTMLDivElement>(null);

  const { activeCell, setActiveCell, isEditing, setIsEditing, handleKeyDown } =
    useGridKeyboard(data.length, columns.length);

  const isSelectionEnabled = onRowSelectionChange !== undefined || rowSelection !== undefined;

  const finalColumns = React.useMemo(() => {
    if (!isSelectionEnabled) return columns;
    const selectionCol: ColumnDef<TData, any> = {
      id: '_select',
      size: 32,
      header: ({ table }) => (
        <input type="checkbox" style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
          checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />
      ),
      cell: ({ row }) => (
        <input type="checkbox" style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
          checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
      ),
    };
    return [selectionCol, ...columns];
  }, [columns, isSelectionEnabled]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: { rowSelection },
    enableRowSelection: isSelectionEnabled,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    meta: { updateData, activeCell, setActiveCell, isEditing, setIsEditing },
  });

  const { rows } = table.getRowModel();
  const leafColumns = table.getVisibleLeafColumns();

  const ROW_NUM_W = 40;
  const totalWidth = ROW_NUM_W + leafColumns.reduce((sum, c) => sum + c.getSize(), 0);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 25,
    overscan: 12,
  });

  // Sync horizontal scroll: body → header
  const handleBodyScroll = React.useCallback(() => {
    if (scrollRef.current && headerRef.current) {
      headerRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  }, []);

  const handleCopy = (e: React.ClipboardEvent) => {
    if (isEditing) return;
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length > 0) {
      e.preventDefault();
      const text = selectedRows.map(row =>
        row.getVisibleCells().filter(c => c.column.id !== '_select').map(c => String(c.getValue() ?? '')).join('\t')
      ).join('\n');
      e.clipboardData.setData('text/plain', text);
      return;
    }
    if (activeCell) {
      e.preventDefault();
      const cell = rows[activeCell.row]?.getVisibleCells()[activeCell.col];
      if (cell) e.clipboardData.setData('text/plain', String(cell.getValue() ?? ''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (isEditing || !updateData || !activeCell) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    text.split('\n').forEach((rowData, rIdx) => {
      const targetRow = activeCell.row + rIdx;
      if (targetRow >= data.length) return;
      rowData.split('\t').forEach((val, cIdx) => {
        const targetCol = activeCell.col + cIdx;
        if (targetCol >= leafColumns.length) return;
        const colId = leafColumns[targetCol].id;
        if (colId !== '_select') updateData(targetRow, colId, val.trim());
      });
    });
  };

  return (
    <div
      style={{ outline: 'none', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onCopy={handleCopy}
      onPaste={handlePaste}
    >
      {/* ── FIXED HEADER (does not scroll vertically) ─────── */}
      <div
        ref={headerRef}
        className={styles.headerBlock}
        style={{ overflowX: 'hidden', flexShrink: 0 }}
      >
        <div style={{ width: totalWidth }}>
          {/* Chrome row: A B C … */}
          <div className={styles.headerRow}>
            <div className={cn(styles.th, styles.frozenColumn)} style={{ width: ROW_NUM_W }} />
            {leafColumns.map((col, i) => (
              <div key={`chr-${col.id}`} className={styles.th} style={{ width: col.getSize() }}>
                {getColumnLetter(i)}
              </div>
            ))}
          </div>
          {/* Field name row */}
          {table.getHeaderGroups().map(hg => (
            <div key={hg.id} className={styles.headerRow}>
              <div className={cn(styles.th, styles.frozenColumn)} style={{ width: ROW_NUM_W }} />
              {hg.headers.map(header => (
                <div key={header.id} className={styles.th} style={{ width: header.getSize() }}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── SCROLLABLE BODY ───────────────────────────────── */}
      <div
        ref={scrollRef}
        className={styles.bodyScroll}
        onScroll={handleBodyScroll}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}
      >
        {/* Virtual rows */}
        <div style={{ height: rowVirtualizer.getTotalSize(), width: totalWidth, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index];
            const isSelected = row.getIsSelected();

            return (
              <div
                key={row.id}
                className={cn(styles.bodyRow, isSelected && styles.selectedRow)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  width: totalWidth,
                }}
              >
                <div className={cn(styles.td, styles.frozenColumn)} style={{ width: ROW_NUM_W }}>
                  {virtualRow.index + 1}
                </div>
                {row.getVisibleCells().map((cell, colIndex) => {
                  const isActive = activeCell?.row === virtualRow.index && activeCell?.col === colIndex;
                  return (
                    <div
                      key={cell.id}
                      className={cn(styles.td, isActive && styles.activeCell)}
                      style={{ width: cell.column.getSize() }}
                      onClick={() => setActiveCell({ row: virtualRow.index, col: colIndex })}
                      onDoubleClick={() => { setActiveCell({ row: virtualRow.index, col: colIndex }); setIsEditing(true); }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Phantom add-row */}
        <div
          className={styles.addRowPhantom}
          style={{ width: Math.max(totalWidth, 300) }}
          onClick={onAddRow}
        >
          <span>+</span>
          <span style={{ fontSize: 12 }}>Thêm dòng mới</span>
        </div>
      </div>
    </div>
  );
}
