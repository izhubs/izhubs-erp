import React, { forwardRef } from 'react';
import styles from './IzSwitch.module.scss';
import { clsx } from 'clsx';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
}

const IzSwitch = forwardRef<HTMLInputElement, IzSwitchProps>(
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
            {/* Native Checkbox visually masked as a Switch Pill */}
            <input
              type="checkbox"
              role="switch"
              id={id}
              ref={ref}
              disabled={disabled}
              className={clsx(
                styles.switch,
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
IzSwitch.displayName = 'IzSwitch';

export { IzSwitch };
