import { useState, useCallback, KeyboardEvent } from 'react';

export type CellCoordinates = { row: number; col: number } | null;

export function useGridKeyboard(rowCount: number, colCount: number) {
  const [activeCell, setActiveCell] = useState<CellCoordinates>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!activeCell) return;

      const { row, col } = activeCell;

      // If actively editing, let the input handle most keys except special navigation commitments
      if (isEditing) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsEditing(false); // Cancel edit
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          setIsEditing(false); // Commit and move down
          setActiveCell({ row: Math.min(row + 1, rowCount - 1), col });
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          setIsEditing(false); // Commit and move right (or left if Shift)
          if (e.shiftKey) {
            setActiveCell({ row, col: Math.max(col - 1, 0) });
          } else {
            setActiveCell({ row, col: Math.min(col + 1, colCount - 1) });
          }
        }
        return; // Don't handle other arrow keys while editing text
      }

      // Navigation Mode (Not Editing)
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
            setActiveCell({ row, col: Math.max(col - 1, 0) });
          } else {
            setActiveCell({ row, col: Math.min(col + 1, colCount - 1) });
          }
          break;
        case 'Enter':
          e.preventDefault();
          // In Google Sheets, Enter moves down when NOT editing, or starts editing?
          // Actually, Enter usually moves down. F2 or typing starts editing.
          setActiveCell({ row: Math.min(row + 1, rowCount - 1), col });
          break;
        case 'F2':
          e.preventDefault();
          setIsEditing(true);
          break;
        default:
          // If typing a printable character, start editing
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            setIsEditing(true);
            // We let the keystroke propagate so it might be caught by the input
            // But usually this requires careful focus management.
          }
          break;
      }
    },
    [activeCell, isEditing, rowCount, colCount]
  );

  return {
    activeCell,
    setActiveCell,
    isEditing,
    setIsEditing,
    handleKeyDown,
  };
}
