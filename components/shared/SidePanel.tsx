// =============================================================
// izhubs ERP — SidePanel (shim → IzSheet)
// Wraps IzSheet compound component with simple open/onClose/title/footer/width API.
// All existing call sites work without changes.
// =============================================================

'use client';

import React from 'react';
import {
  IzSheet,
  IzSheetContent,
  IzSheetHeader,
  IzSheetTitle,
  IzSheetBody,
  IzSheetFooter,
} from '@izerp-theme/components/ui/IzSheet';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Width kept for API compat — IzSheet uses size='md' by default */
  width?: string;
}

export default function SidePanel({ open, onClose, title, footer, children }: SidePanelProps) {
  return (
    <IzSheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <IzSheetContent size="md">
        {title && (
          <IzSheetHeader>
            <IzSheetTitle>{title}</IzSheetTitle>
          </IzSheetHeader>
        )}
        <IzSheetBody>{children}</IzSheetBody>
        {footer && <IzSheetFooter>{footer}</IzSheetFooter>}
      </IzSheetContent>
    </IzSheet>
  );
}
