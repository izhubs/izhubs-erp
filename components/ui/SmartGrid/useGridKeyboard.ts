import { useState, useCallback, KeyboardEvent } from 'react';

export type CellCoordinates = { row: number; col: number } | null;

export function useGridKeyboard(rowCount: number, colCount: number) {
  const [activeCell, setActiveCell] = useState<CellCoordinates>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!activeCell) return;
      // IME composition (e.g. Unikey Vietnamese) — let IME handle the keys
      if (e.nativeEvent.isComposing) return;

      const { row, col } = activeCell;

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
            // 2. Exit editing
            setIsEditing(false);
            // 3. Navigate
            if (e.key === 'Enter') {
              setActiveCell({ row: Math.min(row + 1, rowCount - 1), col });
            } else if (e.shiftKey) {
              if (col > 0)       setActiveCell({ row, col: col - 1 });
              else if (row > 0)  setActiveCell({ row: row - 1, col: colCount - 1 });
            } else {
              if (col < colCount - 1) setActiveCell({ row, col: col + 1 });
              else setActiveCell({ row: Math.min(row + 1, rowCount - 1), col: 0 });
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
          setActiveCell({ row: Math.max(row - 1, 0), col });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveCell({ row: Math.min(row + 1, rowCount - 1), col });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setActiveCell({ row, col: Math.max(col - 1, 0) });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setActiveCell({ row, col: Math.min(col + 1, colCount - 1) });
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            if (col > 0)       setActiveCell({ row, col: col - 1 });
            else if (row > 0)  setActiveCell({ row: row - 1, col: colCount - 1 });
          } else {
            if (col < colCount - 1) setActiveCell({ row, col: col + 1 });
            else setActiveCell({ row: Math.min(row + 1, rowCount - 1), col: 0 });
          }
          break;
        case 'Enter':
        case 'F2':
          e.preventDefault();
          setIsEditing(true);
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            setIsEditing(true);
          }
          break;
      }
    },
    [activeCell, isEditing, rowCount, colCount],
  );

  return { activeCell, setActiveCell, isEditing, setIsEditing, handleKeyDown };
}
