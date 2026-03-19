'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { IzDatePicker, IzDatePickerProps } from './IzDatePicker';
import { IzErrorBoundary } from './IzErrorBoundary';
import styles from './IzInput.module.scss'; // Re-use the existing error/label styling

export interface IzFormDatePickerProps extends IzDatePickerProps {
  name: string;
  label?: string;
  required?: boolean;
  wrapperClassName?: string;
}

export function IzFormDatePicker({ name, label, required, wrapperClassName, ...props }: IzFormDatePickerProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('IzFormDatePicker bắt buộc phải được bọc trong <IzForm>.');
  }

  return (
    <IzErrorBoundary fallback={<div className="text-red-500 text-sm">⚠️ Form Date Picker Error</div>}>
      <Controller
        name={name}
        control={context.control}
        render={({ field, fieldState }) => {
          const errorMessage = fieldState.error?.message;
          const hasError = !!errorMessage;

          return (
            <div className={`${styles.wrapper} ${wrapperClassName || ''}`.trim()}>
              {label && (
                <label 
                  htmlFor={name} 
                  className={`${styles.label} ${required ? styles.required : ''}`}
                >
                  {label}
                </label>
              )}
              
              <IzDatePicker
                id={name}
                error={hasError}
                {...field}
                {...props}
                value={field.value ?? ''}
              />
              
              {hasError && (
                <span className={styles.errorText}>{errorMessage}</span>
              )}
            </div>
          );
        }}
      />
    </IzErrorBoundary>
  );
}
