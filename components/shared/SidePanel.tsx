// =============================================================
// izhubs ERP — SidePanel
// Slide-in side panel (right side). Used for:
//   - Contact detail preview (Contacts page)
//   - Lead detail preview (Leads page)
//   - Task detail (Tasks page)
// Does NOT replace full detail pages — provides quick preview.
// =============================================================

'use client';

import React, { useEffect } from 'react';
import styles from './SidePanel.module.scss';
import { IzButton } from '@/components/ui/IzButton';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Footer slot for action buttons */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Width in CSS units — default 420px */
  width?: string;
}

export default function SidePanel({
  open,
  onClose,
  title,
  footer,
  children,
  width = '420px',
}: SidePanelProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        style={{ width }}
        aria-label={title}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <IzButton
            variant="ghost"
            size="icon"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </IzButton>
        </div>

        {/* Content */}
        <div className={styles.content}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>
    </>
  );
}
