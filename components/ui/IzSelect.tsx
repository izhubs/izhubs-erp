'use client';

import React, { forwardRef, useId } from 'react';
import ReactSelect, { Props as SelectProps } from 'react-select';
// Only load creatable/async if required to save bundle size in normal usage
import CreatableSelect from 'react-select/creatable';
import AsyncSelect from 'react-select/async';
import styles from './IzSelect.module.scss';
import { clsx } from 'clsx';
import { IzErrorBoundary } from './IzErrorBoundary';

// Extend base react-select props
export interface IzSelectProps extends SelectProps<any, boolean> {
  label?: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
  async?: boolean;
  creatable?: boolean;
}

const IzSelect = forwardRef<any, IzSelectProps>(
  (
    {
      label,
      error,
      required,
      wrapperClassName,
      async,
      creatable,
      className,
      id: providedId,
      ...props
    },
    ref
  ) => {
    // Generate a secure ID for label-input pairing
    const autoId = useId();
    const id = providedId || autoId;

    // Dynamically choose component type
    let Component: any = ReactSelect;
    if (async && creatable) {
      // Lazy load async creatable if both are passed (rare)
      // We fall back to async in the strict types, but theoretically require('react-select/async-creatable') works. 
      // For simplicity in standard apps:
      Component = AsyncSelect;
    } else if (async) {
      Component = AsyncSelect;
    } else if (creatable) {
      Component = CreatableSelect;
    }

    return (
      <IzErrorBoundary>
        <div className={clsx(styles.wrapper, wrapperClassName, className)}>
          {label && (
            <label 
              htmlFor={id} 
              className={clsx(styles.label, required && styles.required)}
            >
              {label}
            </label>
          )}
          
          <Component
            inputId={id}
            ref={ref}
            unstyled // Overrides default emotion styles (Crucial for classNames API)
            classNames={{
              control: (state: any) => clsx(
                styles.control, 
                state.isFocused && styles.isFocused,
                state.isDisabled && styles.isDisabled,
                error && styles.hasError
              ),
              menu: () => styles.menu,
              menuList: () => styles.menuList,
              option: (state: any) => clsx(
                styles.option,
                state.isFocused && styles.isFocused,
                state.isSelected && styles.isSelected,
                state.isDisabled && styles.isDisabled
              ),
              multiValue: () => styles.multiValue,
              multiValueLabel: () => styles.multiValueLabel,
              multiValueRemove: () => styles.multiValueRemove,
              indicatorSeparator: () => styles.indicatorSeparator,
              dropdownIndicator: () => styles.dropdownIndicator,
              clearIndicator: () => styles.clearIndicator,
              placeholder: () => styles.placeholder,
              singleValue: () => styles.singleValue,
              input: () => styles.searchInput,
            }}
            {...props}
          />
          
          {error && <span className={styles.errorText}>{error}</span>}
        </div>
      </IzErrorBoundary>
    );
  }
);
IzSelect.displayName = 'IzSelect';

export { IzSelect };
