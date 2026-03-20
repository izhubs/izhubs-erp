'use client';

import * as React from 'react';
import { RowData, CellContext } from '@tanstack/react-table';
import { CellCoordinates } from './useGridKeyboard';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    activeCell?: CellCoordinates;
    setActiveCell?: (cell: CellCoordinates) => void;
    isEditing?: boolean;
    setIsEditing?: (v: boolean) => void;
  }
}

interface EditableCellProps<TData> {
  context: CellContext<TData, unknown>;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', height: '100%',
  border: 'none', background: 'transparent', outline: 'none',
  padding: '0 6px', margin: 0,
  font: 'inherit', color: 'inherit', lineHeight: 'inherit',
  display: 'block', boxSizing: 'border-box',
};

const VIEW_STYLE: React.CSSProperties = {
  width: '100%', height: '100%',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  cursor: 'cell', display: 'flex', alignItems: 'center',
  padding: '0 6px', boxSizing: 'border-box',
};

export function EditableCell<TData>({ context }: EditableCellProps<TData>) {
  const { getValue, row, column, table } = context;
  const initialValue = getValue();
  const [value, setValue] = React.useState<unknown>(initialValue);

  React.useEffect(() => { setValue(initialValue); }, [initialValue]);

  const meta = table.options.meta;
  const rowIndex = row.index;
  const visibleColumns = table.getVisibleLeafColumns();
  const colIndex = visibleColumns.findIndex(c => c.id === column.id);

  const isActive  = meta?.activeCell?.row === rowIndex && meta?.activeCell?.col === colIndex;
  const isEditing = isActive && meta?.isEditing;

  // Called by onBlur — which is guaranteed to fire before the grid moves to the next cell
  // because useGridKeyboard now calls element.blur() explicitly before navigating.
  const commit = () => {
    if (meta?.updateData && value !== initialValue) {
      meta.updateData(rowIndex, column.id, value);
    }
  };

  const activate = (e: React.MouseEvent) => {
    e.stopPropagation();
    meta?.setActiveCell?.({ row: rowIndex, col: colIndex });
    if (meta?.isEditing && !isActive) meta?.setIsEditing?.(false);
  };

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    meta?.setActiveCell?.({ row: rowIndex, col: colIndex });
    meta?.setIsEditing?.(true);
  };

  const colMeta = column.columnDef.meta as { type?: string; options?: { label: string; value: string }[] } | undefined;

  let displayValue = String(value ?? '');
  if (colMeta?.type === 'select' && colMeta.options) {
    displayValue = colMeta.options.find(o => o.value === value)?.label ?? displayValue;
  }

  if (isEditing) {
    if (colMeta?.type === 'select') {
      return (
        <select
          autoFocus
          style={{ ...INPUT_STYLE, cursor: 'pointer' }}
          value={String(value ?? '')}
          onChange={(e) => {
            const newVal = e.target.value;
            setValue(newVal);
            // Auto commit immediately for select dropdowns
            if (meta?.updateData && newVal !== initialValue) {
              meta.updateData(rowIndex, column.id, newVal);
            }
            meta?.setIsEditing?.(false);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            // Stop grid from hijacking arrow/enter keys while dropdown is open
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
              e.stopPropagation();
            }
            if (e.key === 'Escape') {
              setValue(initialValue);
              e.currentTarget.onblur = null;
              meta?.setIsEditing?.(false);
            }
          }}
        >
          <option value="" disabled style={{ color: 'var(--color-text)', background: 'var(--color-bg-surface)' }}>-- Chọn --</option>
          {colMeta.options?.map(opt => (
            <option key={opt.value} value={opt.value} style={{ color: 'var(--color-text)', background: 'var(--color-bg-surface)' }}>{opt.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        style={INPUT_STYLE}
        value={String(value ?? '')}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          // IME (Unikey etc.) — let composition complete, don't handle navigation
          if (e.nativeEvent.isComposing) return;
          // Allow text cursor movement within the input
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.stopPropagation();
          // Escape: restore original value before blur fires
          if (e.key === 'Escape') {
            setValue(initialValue);
            // Override onBlur so it doesn't commit the discarded value
            e.currentTarget.onblur = null;
          }
          // Tab/Enter: let the event bubble to the grid — grid will blur() this input
          // BEFORE moving to next cell, so onBlur → commit() fires at the right time.
        }}
      />
    );
  }

  return (
    <div style={VIEW_STYLE} onClick={activate} onDoubleClick={startEdit}>
      {displayValue}
    </div>
  );
}
