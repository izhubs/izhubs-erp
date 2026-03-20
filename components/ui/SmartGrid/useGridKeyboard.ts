import { useState, useCallback, KeyboardEvent } from 'react';

export type CellCoordinates = { row: number; col: number } | null;

export function useGridKeyboard(
  rowCount: number,
  colCount: number,
  firstEditableCol: number = 0,
  onDeleteSelection?: (start: CellCoordinates, end: CellCoordinates) => void
) {
  const [activeCell, setActiveCell] = useState<CellCoordinates>(null);
  const [selectionEndCell, setSelectionEndCell] = useState<CellCoordinates>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!activeCell) return;
      // IME composition (e.g. Unikey Vietnamese) — let IME handle the keys
      if (e.nativeEvent.isComposing) return;

      const { row, col } = activeCell;
      const endRow = selectionEndCell?.row ?? row;
      const endCol = selectionEndCell?.col ?? col;

      if (isEditing) {
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            // Blur without committing — the active input's onKeyDown handles restoration
            (document.activeElement as HTMLElement | null)?.blur();
            setIsEditing(false);
            break;

          case 'Enter':
          case 'Tab': {
            e.preventDefault();
            // 1. Blur active input first → triggers onBlur → commits value in EditableCell
            (document.activeElement as HTMLElement | null)?.blur();
            
            // 2. Navigate and manage Edit state
            if (e.key === 'Enter') {
              setIsEditing(false); // Enter commits and exits edit mode
              setActiveCell({ row: Math.min(row + 1, rowCount - 1), col });
            } else {
              // Tab commits, navigates to next cell, and REMAINS in edit mode
              if (e.shiftKey) {
                if (col > firstEditableCol) setActiveCell({ row, col: col - 1 });
                else if (row > 0)           setActiveCell({ row: row - 1, col: colCount - 1 });
              } else {
                if (col < colCount - 1) setActiveCell({ row, col: col + 1 });
                else setActiveCell({ row: Math.min(row + 1, rowCount - 1), col: firstEditableCol });
              }
            }
            break;
          }
          // Let arrow keys propagate normally (cursor in text)
          default:
            break;
        }
        return;
      }

      // ── Navigation mode ──────────────────────────────────────────
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (e.shiftKey) {
            setSelectionEndCell({ row: Math.max(endRow - 1, 0), col: endCol });
          } else {
            setActiveCell({ row: Math.max(row - 1, 0), col });
            setSelectionEndCell(null);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (e.shiftKey) {
            setSelectionEndCell({ row: Math.min(endRow + 1, rowCount - 1), col: endCol });
          } else {
            setActiveCell({ row: Math.min(row + 1, rowCount - 1), col });
            setSelectionEndCell(null);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            setSelectionEndCell({ row: endRow, col: Math.max(endCol - 1, 0) });
          } else {
            setActiveCell({ row, col: Math.max(col - 1, 0) });
            setSelectionEndCell(null);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            setSelectionEndCell({ row: endRow, col: Math.min(endCol + 1, colCount - 1) });
          } else {
            setActiveCell({ row, col: Math.min(col + 1, colCount - 1) });
            setSelectionEndCell(null);
          }
          break;
        case 'Tab':
          e.preventDefault();
          setSelectionEndCell(null);
          if (e.shiftKey) {
            if (col > firstEditableCol) setActiveCell({ row, col: col - 1 });
            else if (row > 0)           setActiveCell({ row: row - 1, col: colCount - 1 });
          } else {
            if (col < colCount - 1) setActiveCell({ row, col: col + 1 });
            else setActiveCell({ row: Math.min(row + 1, rowCount - 1), col: firstEditableCol });
          }
          break;
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          if (onDeleteSelection) {
            onDeleteSelection(activeCell, selectionEndCell || activeCell);
          }
          break;
        case 'Enter':
        case 'F2':
          e.preventDefault();
          setIsEditing(true);
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            setSelectionEndCell(null);
            setIsEditing(true);
          }
          break;
      }
    },
    [activeCell, selectionEndCell, isEditing, rowCount, colCount, firstEditableCol, onDeleteSelection],
  );

  return { activeCell, setActiveCell, selectionEndCell, setSelectionEndCell, isEditing, setIsEditing, handleKeyDown };
}
