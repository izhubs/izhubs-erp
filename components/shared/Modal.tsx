// =============================================================
// izhubs ERP — Modal (shim → IzModal)
// Wraps IzModal compound component with simple open/onClose/title/footer API.
// All existing call sites work without changes.
// =============================================================

'use client';

import React from 'react';
import {
  IzModal,
  IzModalContent,
  IzModalHeader,
  IzModalTitle,
  IzModalBody,
  IzModalFooter,
} from '@izerp-theme/components/ui/IzModal';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Max width — kept for API compat; IzModal uses size prop internally */
  maxWidth?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, footer, children }: ModalProps) {
  return (
    <IzModal open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <IzModalContent hideCloseButton={false}>
        {title && (
          <IzModalHeader>
            <IzModalTitle>{title}</IzModalTitle>
          </IzModalHeader>
        )}
        <IzModalBody>{children}</IzModalBody>
        {footer && <IzModalFooter>{footer}</IzModalFooter>}
      </IzModalContent>
    </IzModal>
  );
}
