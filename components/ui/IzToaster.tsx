'use client';

import React from 'react';
import {
  IzToast,
  IzToastClose,
  IzToastDescription,
  IzToastProvider,
  IzToastTitle,
  IzToastViewport,
} from './IzToast';
import { useToast } from '@/hooks/use-toast';

export function IzToaster() {
  const { toasts } = useToast();

  return (
    <IzToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <IzToast key={id} {...props}>
            <div className="grid gap-1">
              {title && <IzToastTitle>{title}</IzToastTitle>}
              {description && (
                <IzToastDescription>{description}</IzToastDescription>
              )}
            </div>
            {action}
            <IzToastClose />
          </IzToast>
        );
      })}
      <IzToastViewport />
    </IzToastProvider>
  );
}
