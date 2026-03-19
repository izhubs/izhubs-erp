import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './IzButton.module.scss';

export interface IzButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const IzButton = forwardRef<HTMLButtonElement, IzButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Generate class names dynamically based on variant and size (Fallback: default/md)
    const validVariant = ['default', 'secondary', 'outline', 'ghost', 'destructive'].includes(variant) ? variant : 'default';
    const validSize = ['sm', 'md', 'lg', 'icon'].includes(size) ? size : 'md';

    const classes = [
      styles.button,
      styles[`variant${validVariant.charAt(0).toUpperCase() + validVariant.slice(1)}`],
      styles[`size${validSize.charAt(0).toUpperCase() + validSize.slice(1)}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className={styles.spinner}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

IzButton.displayName = 'IzButton';
