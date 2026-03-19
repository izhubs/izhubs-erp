import React, { forwardRef } from 'react';
import styles from './IzTextarea.module.scss';
import { clsx } from 'clsx';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

const IzTextarea = forwardRef<HTMLTextAreaElement, IzTextareaProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      error,
      required,
      id: providedId,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if none provided, useful for linking label and textarea
    const autoId = React.useId();
    const id = providedId || autoId;

    return (
      <IzErrorBoundary>
        <div className={clsx(styles.wrapper, wrapperClassName)}>
          {/* Label */}
          {label && (
            <label 
              htmlFor={id} 
              className={clsx(styles.label, required && styles.required)}
            >
              {label}
            </label>
          )}

          {/* Textarea Container */}
          <div className={styles.inputContainer}>
            <textarea
              id={id}
              ref={ref}
              required={required}
              className={clsx(
                styles.textarea,
                error && styles.hasError,
                className
              )}
              {...props}
            />
          </div>

          {/* Error Message */}
          {error && <span className={styles.errorText}>{error}</span>}
        </div>
      </IzErrorBoundary>
    );
  }
);
IzTextarea.displayName = 'IzTextarea';

export { IzTextarea };
