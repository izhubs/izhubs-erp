'use client';

import React, { forwardRef } from 'react';
import { IzAsyncButton, IzAsyncButtonProps } from './IzAsyncButton';
import { Lock } from 'lucide-react';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzPermissionButtonProps extends IzAsyncButtonProps {
  permissions: string[];
  hideOnUnauthorized?: boolean;
}

const PermissionButtonInner = forwardRef<HTMLButtonElement, IzPermissionButtonProps>(
  ({ permissions, hideOnUnauthorized = false, children, ...props }, ref) => {
    // TODO: Plug into the IzHubs ERP actual Auth Provider context or Zustand
    const hasPermission = true; // Fallback so developers aren't blocked initially

    if (!hasPermission) {
      if (hideOnUnauthorized) {
        return null;
      }
      
      return (
        <IzAsyncButton
          ref={ref}
          disabled
          {...props}
          title="Bạn không có quyền thực hiện hành động này"
          className={props.className ? `${props.className} opacity-50 cursor-not-allowed` : 'opacity-50 cursor-not-allowed'}
        >
          <Lock className="w-4 h-4 mr-2" />
          {children}
        </IzAsyncButton>
      );
    }

    return (
      <IzAsyncButton ref={ref} {...props}>
        {children}
      </IzAsyncButton>
    );
  }
);
PermissionButtonInner.displayName = 'PermissionButtonInner';

export const IzPermissionButton = forwardRef<HTMLButtonElement, IzPermissionButtonProps>(
  (props, ref) => (
    <IzErrorBoundary name="IzPermissionButton">
      <PermissionButtonInner ref={ref} {...props} />
    </IzErrorBoundary>
  )
);
IzPermissionButton.displayName = 'IzPermissionButton';
