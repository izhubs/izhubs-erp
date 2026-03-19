import React, { forwardRef } from 'react';
import styles from './IzRadioGroup.module.scss';
import { clsx } from 'clsx';
import { IzRadio } from './IzRadio';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzRadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
}

export interface IzRadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string;
  options: IzRadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  wrapperClassName?: string;
}

const IzRadioGroup = forwardRef<HTMLDivElement, IzRadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      label,
      error,
      required,
      disabled,
      orientation = 'vertical',
      className,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    return (
      <IzErrorBoundary>
        <div 
          className={clsx(styles.wrapper, wrapperClassName, className)} 
          ref={ref}
          role="radiogroup"
          aria-labelledby={label ? `${name}-label` : undefined}
          {...props}
        >
          {label && (
            <div id={`${name}-label`} className={clsx(styles.label, required && styles.required)}>
              {label}
            </div>
          )}

          <div className={clsx(styles.optionsContainer, styles[orientation])}>
            {options.map((opt) => (
              <IzRadio
                key={opt.value}
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange && onChange(e.target.value)}
                label={opt.label}
                description={opt.description}
                disabled={disabled}
                error={error ? "true" : undefined} // Pass a flag so the radio turns red
              />
            ))}
          </div>

          {error && <span className={styles.errorText}>{error}</span>}
        </div>
      </IzErrorBoundary>
    );
  }
);
IzRadioGroup.displayName = 'IzRadioGroup';

export { IzRadioGroup };
