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
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Trash2 } from 'lucide-react';
import styles from './SmartGrid.module.scss';
import { cn, getColumnLetter } from './utils';
import { useGridKeyboard, type CellCoordinates } from './useGridKeyboard';

interface SmartGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  /** Called when the trailing empty row is committed with data */
  onAddRow?: (draft: Record<string, unknown>) => void;
  onDeleteRows?: (keys: string[]) => void;
  pinnedColumns?: string[];
}

export function SmartGrid<TData>({
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  updateData,
  onAddRow,
  onDeleteRows,
  pinnedColumns,
}: SmartGridProps<TData>) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const isSelectionEnabled = onRowSelectionChange !== undefined || rowSelection !== undefined;

  // Context Menu & Drag State
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; rowId: string } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    // Also close on context menu outside
    window.addEventListener('contextmenu', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('contextmenu', handleClick);
    };
  }, []);

  React.useEffect(() => {
    if (!isDragging) return;
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, [isDragging]);

  const [draftRow, setDraftRow] = React.useState<Record<string, unknown>>({});
  const [draftEditing, setDraftEditing] = React.useState<string | null>(null);
  const draftRowRef = React.useRef(draftRow);
  const firstDraftCellRef = React.useRef<HTMLInputElement | HTMLSelectElement | null>(null);

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

  const handleDeleteSelection = React.useCallback((start: CellCoordinates, end: CellCoordinates) => {
    if (!start || !end || !updateData) return;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const colDef = finalColumns[c];
        const colId = (colDef as any)?.id || (colDef as any)?.accessorKey;
        if (colId && colId !== '_select') {
          // Send null instead of '' so it doesn't fail Zod validation for things like .email()
          updateData(r, colId, null);
        }
      }
    }
  }, [finalColumns, updateData]);

  const { activeCell, setActiveCell, selectionEndCell, setSelectionEndCell, isEditing, setIsEditing, handleKeyDown } =
    useGridKeyboard(data.length, isSelectionEnabled ? columns.length + 1 : columns.length, isSelectionEnabled ? 1 : 0, handleDeleteSelection);

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
    const targetDraft = draftRowRef.current;
    const hasData = Object.values(targetDraft).some(v => v !== '' && v != null);
    if (hasData && onAddRow) {
      onAddRow(targetDraft);
      setDraftRow({});
      draftRowRef.current = {};
      
      // Auto-focus the first cell of the newly cleared draft row for continuous entry
      setTimeout(() => {
        if (firstDraftCellRef.current) {
          firstDraftCellRef.current.focus();
        }
      }, 50);
    }
  }, [onAddRow]);

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
                onContextMenu={(e) => {
                  if (onDeleteRows) {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({ x: e.clientX, y: e.clientY, rowId: String((row.original as any).id) });
                  }
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
                  const rIdx = virtualRow.index;
                  const cIdx = colIndex;
                  const isActive = activeCell?.row === rIdx && activeCell?.col === cIdx;
                  
                  let inSelection = false;
                  let isSelectionTop = false;
                  let isSelectionBottom = false;
                  let isSelectionLeft = false;
                  let isSelectionRight = false;

                  if (activeCell && selectionEndCell) {
                    const minR = Math.min(activeCell.row, selectionEndCell.row);
                    const maxR = Math.max(activeCell.row, selectionEndCell.row);
                    const minC = Math.min(activeCell.col, selectionEndCell.col);
                    const maxC = Math.max(activeCell.col, selectionEndCell.col);
                    if (rIdx >= minR && rIdx <= maxR && cIdx >= minC && cIdx <= maxC) {
                      inSelection = true;
                      if (rIdx === minR) isSelectionTop = true;
                      if (rIdx === maxR) isSelectionBottom = true;
                      if (cIdx === minC) isSelectionLeft = true;
                      if (cIdx === maxC) isSelectionRight = true;
                    }
                  }

                  const isPinned = cell.column.getIsPinned();
                  const style: React.CSSProperties = { width: cell.column.getSize() };

                  // Build boundary shadow
                  if (inSelection && (isSelectionTop || isSelectionBottom || isSelectionLeft || isSelectionRight)) {
                    const shadow = [];
                    if (isSelectionTop) shadow.push('inset 0 1px 0 0 var(--color-primary)');
                    if (isSelectionBottom) shadow.push('inset 0 -1px 0 0 var(--color-primary)');
                    if (isSelectionLeft) shadow.push('inset 1px 0 0 0 var(--color-primary)');
                    if (isSelectionRight) shadow.push('inset -1px 0 0 0 var(--color-primary)');
                    style.boxShadow = shadow.join(', ');
                  }

                  if (isPinned === 'left') {
                    style.position = 'sticky';
                    style.left = cell.column.getStart('left') + ROW_NUM_W;
                    style.zIndex = isActive ? 3 : 2;
                    style.backgroundColor = 'var(--color-bg-surface)';
                  }
                  return (
                    <div
                      key={cell.id}
                      className={cn(styles.td, isActive && styles.activeCell, inSelection && styles.rangeSelectedCell)}
                      style={style}
                      onMouseDown={(e) => {
                        if (e.button !== 0) return; // Only left click
                        if (isEditing) return; // Don't drag start if editing
                        setActiveCell({ row: rIdx, col: colIndex });
                        setSelectionEndCell(null);
                        setIsDragging(true);
                      }}
                      onMouseEnter={() => {
                        if (isDragging && !isEditing) {
                          setSelectionEndCell({ row: rIdx, col: colIndex });
                        }
                      }}
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
              const isFirstDataCol = i === (leafColumns[0]?.id === '_select' ? 1 : 0);

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
              const colMeta = col.columnDef.meta as { type?: string; options?: { label: string; value: string }[] } | undefined;

              if (colMeta?.type === 'select') {
                return (
                  <div key={colId} className={cn(styles.td, styles.draftCell)} style={style}>
                    <select
                      ref={isFirstDataCol ? firstDraftCellRef as React.Ref<HTMLSelectElement> : undefined}
                      style={{
                        width: '100%', height: '100%',
                        border: 'none', background: 'transparent', outline: 'none',
                        padding: '0 6px', margin: 0,
                        font: 'inherit', color: 'inherit',
                        cursor: 'pointer',
                        opacity: isEditingThis || (val !== '') ? 1 : 0.3,
                      }}
                      value={String(val)}
                      onFocus={() => {
                        setDraftEditing(colId);
                        setActiveCell(null);
                      }}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        // Synchronous ref update so timeouts catch it instantly!
                        draftRowRef.current = { ...draftRowRef.current, [colId]: newVal };
                        setDraftRow(draftRowRef.current);
                      }}
                      onBlur={() => setDraftEditing(null)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        // Allow native select keys to work normally
                        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.stopPropagation();
                        if (e.key === 'Escape') { 
                          setDraftRow({}); 
                          draftRowRef.current = {};
                          setDraftEditing(null); 
                        }
                        // Delayed commit so native Select logic finishes updating onChange
                        if (e.key === 'Enter') {
                          setTimeout(() => commitDraftRow(), 50);
                        }
                        if (e.key === 'Tab' && !e.shiftKey && i === leafColumns.length - 1) {
                          setTimeout(() => commitDraftRow(), 50);
                        }
                      }}
                    >
                      <option value="" disabled style={{ color: 'var(--color-text)', background: 'var(--color-bg-surface)' }}>-- Chọn --</option>
                      {colMeta.options?.map(opt => (
                        <option key={opt.value} value={opt.value} style={{ color: 'var(--color-text)', background: 'var(--color-bg-surface)' }}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div
                  key={colId}
                  className={cn(styles.td, styles.draftCell)}
                  style={style}
                >
                  <input
                    ref={isFirstDataCol ? firstDraftCellRef as React.Ref<HTMLInputElement> : undefined}
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
                    onChange={(e) => {
                      const newVal = e.target.value;
                      // Synchronous ref update
                      draftRowRef.current = { ...draftRowRef.current, [colId]: newVal };
                      setDraftRow(draftRowRef.current);
                    }}
                    onBlur={() => setDraftEditing(null)}
                    onKeyDown={(e) => {
                      e.stopPropagation(); // Stop bubbling to Grid
                      if (e.key === 'Escape') { 
                        setDraftRow({}); 
                        draftRowRef.current = {};
                        setDraftEditing(null); 
                      }
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

      {/* ── CONTEXT MENU ──────────────────────────────────── */}
      {contextMenu && onDeleteRows && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: 4,
            minWidth: 140,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-danger)', fontSize: 13, gap: 8, padding: '6px 10px' }}
            onClick={() => {
              if (confirm('Xóa dòng đã chọn?')) {
                onDeleteRows([contextMenu.rowId]);
              }
              setContextMenu(null);
            }}
          >
            <Trash2 size={14} />
            Xóa dòng
          </button>
        </div>
      )}
    </div>
  );
}
