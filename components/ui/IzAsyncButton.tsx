'use client';

import React, { useState, forwardRef, useCallback } from 'react';
import { IzButton, IzButtonProps } from './IzButton';

export interface IzAsyncButtonProps extends Omit<IzButtonProps, 'onClick'> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  onError?: (error: unknown) => void;
}

export const IzAsyncButton = forwardRef<HTMLButtonElement, IzAsyncButtonProps>(
  ({ onClick, onError, ...props }, ref) => {
    const [isAsyncLoading, setIsAsyncLoading] = useState(false);

    const handleClick = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!onClick) return;
        
        try {
          // Double-click prevention mapping logic is handled inside isAsyncLoading
          setIsAsyncLoading(true);
          await onClick(e);
        } catch (error) {
          if (onError) {
            onError(error);
          } else {
            console.error('[IzAsyncButton] Runtime error:', error);
          }
        } finally {
          setIsAsyncLoading(false);
        }
      },
      [onClick, onError]
    );

    return (
      <IzButton
        ref={ref}
        onClick={onClick ? handleClick : undefined}
        isLoading={props.isLoading || isAsyncLoading}
        {...props}
      />
    );
  }
);

IzAsyncButton.displayName = 'IzAsyncButton';
