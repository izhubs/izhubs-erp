import React, { forwardRef } from 'react';
import styles from './IzRadio.module.scss';
import { clsx } from 'clsx';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
}

const IzRadio = forwardRef<HTMLInputElement, IzRadioProps>(
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
              type="radio"
              id={id}
              ref={ref}
              disabled={disabled}
              className={clsx(
                styles.radio,
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
IzRadio.displayName = 'IzRadio';

export { IzRadio };
