'use client';

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  RowSelectionState,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import styles from './SmartGrid.module.scss';
import { cn, getColumnLetter } from './utils';
import { useGridKeyboard } from './useGridKeyboard';

interface SmartGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  /** Called when the trailing empty row is committed with data */
  onAddRow?: (draft: Record<string, unknown>) => void;
  pinnedColumns?: string[];
}

export function SmartGrid<TData>({
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  updateData,
  onAddRow,
  pinnedColumns,
}: SmartGridProps<TData>) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const isSelectionEnabled = onRowSelectionChange !== undefined || rowSelection !== undefined;

  const { activeCell, setActiveCell, isEditing, setIsEditing, handleKeyDown } =
    useGridKeyboard(data.length, isSelectionEnabled ? columns.length + 1 : columns.length, isSelectionEnabled ? 1 : 0);

  // Draft state for the trailing empty row
  const [draftRow, setDraftRow] = React.useState<Record<string, unknown>>({});
  const [draftEditing, setDraftEditing] = React.useState<string | null>(null);

  // Sorting state
  const [sorting, setSorting] = React.useState<SortingState>([]);

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

  const finalPinned = React.useMemo(() => {
    const pins = pinnedColumns ? [...pinnedColumns] : [];
    if (isSelectionEnabled && !pins.includes('_select')) {
      pins.unshift('_select');
    }
    return { left: pins };
  }, [pinnedColumns, isSelectionEnabled]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: { rowSelection, columnPinning: finalPinned, sorting },
    enableRowSelection: isSelectionEnabled,
    onRowSelectionChange,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
    meta: { updateData, activeCell, setActiveCell, isEditing, setIsEditing },
  });

  const { rows } = table.getRowModel();
  const leafColumns = table.getVisibleLeafColumns();
  // Data columns only (exclude _select for draft row)
  const dataColumns = leafColumns.filter(c => c.id !== '_select');

  const ROW_NUM_W = 40;
  const totalWidth = ROW_NUM_W + leafColumns.reduce((sum, c) => sum + c.getSize(), 0);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 25,
    overscan: 12,
  });

  // Commit draft row when focus leaves and has data
  const commitDraftRow = React.useCallback(() => {
    setDraftEditing(null);
    const hasData = Object.values(draftRow).some(v => v !== '' && v != null);
    if (hasData && onAddRow) {
      onAddRow(draftRow);
      setDraftRow({});
    }
  }, [draftRow, onAddRow]);

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
    text.split(/\r?\n/).forEach((rowData, rIdx) => {
      if (!rowData.trim()) return; // skip empty rows
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
      {/* ── FIXED HEADER ─────────────────────────────────── */}
      <div ref={headerRef} className={styles.headerBlock} style={{ overflowX: 'hidden', flexShrink: 0 }}>
        <div style={{ width: totalWidth }}>
          {/* chrome row: A B C … */}
          <div className={styles.headerRow}>
            <div className={styles.frozenColumn}
              style={{ width: ROW_NUM_W, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} />
            {leafColumns.map((col, i) => {
              const isPinned = col.getIsPinned();
              const style: React.CSSProperties = { width: col.getSize() };
              if (isPinned === 'left') {
                style.position = 'sticky';
                style.left = col.getStart('left') + ROW_NUM_W;
                style.zIndex = Math.max(2, 10 - i);
                style.backgroundColor = 'var(--color-bg-hover)';
              }
              return (
                <div key={`chr-${col.id}`} className={styles.th} style={style}>
                  {getColumnLetter(i)}
                </div>
              );
            })}
          </div>
          {/* field name row */}
          {table.getHeaderGroups().map(hg => (
            <div key={hg.id} className={styles.headerRow}>
              <div className={styles.frozenColumn}
                style={{ width: ROW_NUM_W, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} />
              {hg.headers.map((header, i) => {
                const isPinned = header.column.getIsPinned();
                const style: React.CSSProperties = { width: header.getSize(), position: 'relative' };
                if (isPinned === 'left') {
                  style.position = 'sticky';
                  style.left = header.column.getStart('left') + ROW_NUM_W;
                  style.zIndex = Math.max(3, 10 - i);
                  style.backgroundColor = 'var(--color-bg-hover)';
                }
                return (
                  <div key={header.id} className={styles.th} style={style}>
                    <div
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      style={{
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        width: '100%', height: '100%', userSelect: 'none'
                      }}
                      title={header.column.getCanSort() ? "Click to sort" : undefined}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? <ArrowUpNarrowWide size={12} opacity={0.7} /> : null}
                      {header.column.getIsSorted() === 'desc' ? <ArrowDownWideNarrow size={12} opacity={0.7} /> : null}
                    </div>
                    {/* Resizer handle */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(styles.resizer, header.column.getIsResizing() ? styles.isResizing : '')}
                      />
                    )}
                  </div>
                );
              })}
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
        {/* Virtual data rows */}
        <div style={{ height: rowVirtualizer.getTotalSize(), width: totalWidth, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index];
            const isSelected = row.getIsSelected();

            return (
              <div
                key={row.id}
                className={cn(styles.bodyRow, isSelected && styles.selectedRow)}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  width: totalWidth,
                }}
              >
                {/* Row number — NOT clickable/editable */}
                <div
                  className={cn(styles.td, styles.frozenColumn)}
                  style={{ width: ROW_NUM_W, pointerEvents: 'none', userSelect: 'none' }}
                >
                  {virtualRow.index + 1}
                </div>

                {row.getVisibleCells().map((cell, colIndex) => {
                  const isActive = activeCell?.row === virtualRow.index && activeCell?.col === colIndex;
                  const isPinned = cell.column.getIsPinned();
                  const style: React.CSSProperties = { width: cell.column.getSize() };
                  if (isPinned === 'left') {
                    style.position = 'sticky';
                    style.left = cell.column.getStart('left') + ROW_NUM_W;
                    style.zIndex = isActive ? 3 : 2;
                    style.backgroundColor = 'var(--color-bg-surface)';
                  }
                  return (
                    <div
                      key={cell.id}
                      className={cn(styles.td, isActive && styles.activeCell)}
                      style={style}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── Trailing empty row (real input row for new data) ── */}
        {onAddRow && (
          <div className={styles.bodyRow} style={{ width: totalWidth, position: 'relative' }}>
            {/* Row number placeholder */}
            <div
              className={cn(styles.td, styles.frozenColumn)}
              style={{ width: ROW_NUM_W, color: 'var(--color-text-muted)', opacity: 0.4, userSelect: 'none', pointerEvents: 'none', textAlign: 'center' }}
            >
              {data.length + 1}
            </div>

            {/* Editable cells or placeholders for columns */}
            {leafColumns.map((col, i) => {
              const colId = col.id;
              const isPinned = col.getIsPinned();
              const style: React.CSSProperties = { width: col.getSize() };
              if (isPinned === 'left') {
                style.position = 'sticky';
                style.left = col.getStart('left') + ROW_NUM_W;
                style.zIndex = 2;
                style.backgroundColor = 'var(--color-bg-surface)'; // override if draftCell doesn't supply one or needs to be opaque
              }

              if (colId === '_select') {
                return <div key={colId} className={styles.td} style={style} />;
              }

              const isEditingThis = draftEditing === colId;
              const val = draftRow[colId] ?? '';

              return (
                <div
                  key={colId}
                  className={cn(styles.td, styles.draftCell)}
                  style={style}
                >
                  <input
                    style={{
                      width: '100%', height: '100%',
                      border: 'none', background: 'transparent', outline: 'none',
                      padding: '0 6px', margin: 0,
                      font: 'inherit', color: 'inherit',
                      lineHeight: 'inherit', display: 'block', boxSizing: 'border-box',
                      opacity: isEditingThis || (val !== '') ? 1 : 0.3,
                    }}
                    placeholder={isEditingThis ? '' : '…'}
                    value={String(val)}
                    onFocus={() => {
                      setDraftEditing(colId);
                      setActiveCell(null); // Stop grid from handling grid keys
                    }}
                    onChange={(e) => setDraftRow(prev => ({ ...prev, [colId]: e.target.value }))}
                    onBlur={() => setDraftEditing(null)}
                    onKeyDown={(e) => {
                      e.stopPropagation(); // Stop bubbling to Grid
                      if (e.key === 'Escape') { setDraftRow({}); setDraftEditing(null); }
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        commitDraftRow(); 
                      }
                      if (e.key === 'Tab' && !e.shiftKey && i === leafColumns.length - 1) {
                        e.preventDefault();
                        commitDraftRow();
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
