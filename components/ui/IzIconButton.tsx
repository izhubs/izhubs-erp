import React, { forwardRef } from 'react';
import { IzButton, IzButtonProps } from './IzButton';

export interface IzIconButtonProps extends Omit<IzButtonProps, 'size' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string; // Required parameter for accessibility!
  tooltip?: string;
}

export const IzIconButton = forwardRef<HTMLButtonElement, IzIconButtonProps>(
  ({ icon, 'aria-label': ariaLabel, tooltip, ...props }, ref) => {
    // Fallback if icon fails to render or is missing
    const buttonContent = icon || <span>?</span>; 

    const button = (
      <IzButton ref={ref} size="icon" aria-label={ariaLabel} {...props}>
        {buttonContent}
      </IzButton>
    );

    // Fallback tooltip logic (temporarily uses native title)
    if (tooltip) {
      return React.cloneElement(button as React.ReactElement, { title: tooltip });
    }

    return button;
  }
);

IzIconButton.displayName = 'IzIconButton';
