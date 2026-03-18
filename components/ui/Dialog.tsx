'use client';

// =============================================================
// components/ui/Dialog.tsx
// Radix UI Dialog abstraction — consistent modal pattern across
// the entire app. Replaces all custom modal implementations.
//
// Usage:
//   <Dialog open={open} onOpenChange={setOpen} title="Add Contact">
//     <p>Content here</p>
//   </Dialog>
// =============================================================

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './Dialog.module.scss';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Max width of the dialog panel (default: 520px) */
  maxWidth?: number | string;
  children: ReactNode;
  /** Render a custom footer with action buttons */
  footer?: ReactNode;
  /** Don't close when clicking outside the dialog */
  locked?: boolean;
}

export default function Dialog({
  open,
  onOpenChange,
  title,
  description,
  maxWidth = 520,
  children,
  footer,
  locked = false,
}: Props) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content
          className={styles.content}
          style={{ maxWidth }}
          onPointerDownOutside={locked ? (e) => e.preventDefault() : undefined}
          onEscapeKeyDown={locked ? (e) => e.preventDefault() : undefined}
          aria-describedby={description ? 'dialog-desc' : undefined}
        >
          {/* Header */}
          <div className={styles.header}>
            <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button className={styles.closeBtn} aria-label="Close dialog">
                <X size={16} />
              </button>
            </RadixDialog.Close>
          </div>

          {/* Optional description */}
          {description && (
            <RadixDialog.Description id="dialog-desc" className={styles.description}>
              {description}
            </RadixDialog.Description>
          )}

          {/* Body */}
          <div className={styles.body}>{children}</div>

          {/* Footer */}
          {footer && <div className={styles.footer}>{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
