'use client';

import * as React from 'react';
import { RowData, CellContext, Table } from '@tanstack/react-table';
import { CellCoordinates } from './useGridKeyboard';
import { cn } from './utils';
import styles from './SmartGrid.module.scss';

// Extend TanStack Table Meta
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    activeCell?: CellCoordinates;
    setActiveCell?: (cell: CellCoordinates) => void;
    isEditing?: boolean;
    setIsEditing?: (isEditing: boolean) => void;
  }
}

interface EditableCellProps<TData> {
  context: CellContext<TData, unknown>;
  type?: 'text' | 'number' | 'select' | 'date'; // future proofing
}

export function EditableCell<TData>({ context, type = 'text' }: EditableCellProps<TData>) {
  const { getValue, row, column, table } = context;
  const initialValue = getValue();
  const [value, setValue] = React.useState<any>(initialValue);

  // Sync state if initialValue changes externally
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const meta = table.options.meta;
  const rowIndex = row.index;
  // We need column index for coordinates. In TanStack table, column.getIndex() doesn't exist directly for all visible columns.
  // We can find it via visible columns:
  const visibleColumns = table.getVisibleLeafColumns();
  const colIndex = visibleColumns.findIndex(c => c.id === column.id);

  const isActive = meta?.activeCell?.row === rowIndex && meta?.activeCell?.col === colIndex;
  const isEditing = isActive && meta?.isEditing;

  const onBlur = () => {
    if (meta?.updateData && value !== initialValue) {
      meta.updateData(rowIndex, column.id, value);
    }
  };

  const handleDoubleClick = () => {
    meta?.setActiveCell?.({ row: rowIndex, col: colIndex });
    meta?.setIsEditing?.(true);
  };

  const handleClick = () => {
    if (!meta?.isEditing || !isActive) {
      meta?.setActiveCell?.({ row: rowIndex, col: colIndex });
      if (meta?.isEditing && !isActive) {
          meta?.setIsEditing?.(false);
      }
    }
  };

  if (isEditing) {
    return (
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        className="w-full h-full border-none bg-transparent outline-none px-1"
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          onBlur();
        }}
        // Keyboard events logic is mostly handled by the parent grid Container, 
        // but we can stop propagation for left/right arrows if we want text-cursor movement to work
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.stopPropagation();
          }
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full h-full px-1 overflow-hidden text-ellipsis whitespace-nowrap cursor-cell",
        // The blue border could be handled by the parent TD via className, but we can also do it here if we make this wrapper fill the TD
        // Actually, Google Sheets highlights the cell itself.
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className="truncate">{value as React.ReactNode}</span>
    </div>
  );
}
