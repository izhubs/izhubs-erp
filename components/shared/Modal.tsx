// =============================================================
// izhubs ERP — Modal
// Centered dialog modal with backdrop, ESC close, header/footer slots.
// Used for: Add Contact, Create Deal, Confirm Delete, etc.
// =============================================================

'use client';

import React, { useEffect } from 'react';
import styles from './Modal.module.scss';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Max width of the modal dialog — default 560px */
  maxWidth?: string;
  /** Footer slot: action buttons */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  maxWidth = '560px',
  footer,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden />

      {/* Dialog */}
      <div className={styles.dialog} style={{ maxWidth }}>
        {/* Header */}
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button
              className={`btn btn-ghost ${styles.closeBtn}`}
              onClick={onClose}
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
