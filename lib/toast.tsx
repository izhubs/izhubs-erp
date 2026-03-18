// =============================================================
// izhubs ERP — Toast Notification Store
// Lightweight store using React context (no external dep needed).
// Usage:
//   import { useToast } from '@/lib/toast';
//   const toast = useToast();
//   toast.success('Contact created!');
//   toast.error('Failed to delete');
// =============================================================

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${++counter}`;
    const dur = duration ?? (type === 'error' ? 5000 : 3000);
    setToasts(prev => [...prev, { id, type, message, duration: dur }]);
    // Auto-remove (error stays longer)
    setTimeout(() => removeToast(id), dur);
  }, [removeToast]);

  const success = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const error = useCallback((msg: string) => addToast('error', msg, 5000), [addToast]);
  const warning = useCallback((msg: string) => addToast('warning', msg), [addToast]);
  const info = useCallback((msg: string) => addToast('info', msg), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  return ctx;
}

// ---- Toast UI ----

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const COLORS: Record<ToastType, string> = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#6366f1',
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <>
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="toast-item"
            style={{ borderLeftColor: COLORS[toast.type] }}
          >
            <span className="toast-icon">{ICONS[toast.type]}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .toast-container {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
          max-width: 400px;
        }
        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--color-bg-surface, #1e1e2e);
          border: 1px solid var(--color-border, #333);
          border-left: 4px solid;
          border-radius: var(--radius-md, 8px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          color: var(--color-text, #e0e0e0);
          font-size: var(--font-size-sm, 14px);
          animation: toastSlideIn 0.25s ease-out;
        }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .toast-icon { font-size: 16px; flex-shrink: 0; }
        .toast-message { flex: 1; }
        .toast-close {
          background: none;
          border: none;
          color: var(--color-text-muted, #888);
          cursor: pointer;
          font-size: 14px;
          padding: 2px 4px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .toast-close:hover { background: var(--color-bg-hover, rgba(255,255,255,0.1)); }
      `}} />
    </>
  );
}
