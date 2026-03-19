import React, { forwardRef } from 'react';
import styles from './IzCheckbox.module.scss';
import { clsx } from 'clsx';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
}

const IzCheckbox = forwardRef<HTMLInputElement, IzCheckboxProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      description,
      error,
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const autoId = React.useId();
    const id = providedId || autoId;

    return (
      <IzErrorBoundary>
        <div className={clsx(styles.wrapper, wrapperClassName)}>
          <div className={styles.mainRow}>
            <input
              type="checkbox"
              id={id}
              ref={ref}
              disabled={disabled}
              className={clsx(
                styles.checkbox,
                error && styles.hasError,
                className
              )}
              {...props}
            />
            {label && (
              <label 
                htmlFor={id} 
                className={clsx(
                  styles.label, 
                  disabled && styles.disabledLabel
                )}
              >
                {label}
              </label>
            )}
          </div>
          
          {description && (
            <div className={styles.description}>
              {description}
            </div>
          )}

          {error && <span className={styles.errorText}>{error}</span>}
        </div>
      </IzErrorBoundary>
    );
  }
);
IzCheckbox.displayName = 'IzCheckbox';

export { IzCheckbox };
