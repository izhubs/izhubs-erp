'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { IzInput, IzInputProps } from './IzInput';
import styles from './IzInput.module.scss';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzFormInputProps extends IzInputProps {
  /** Tên trường dể RHF quản lý (Bắt buộc) */
  name: string;
  /** Tiêu đề của ô nhập (Label hiển thị phía trên) */
  label?: string;
  /** Hiển thị dấu sao đỏ buộc nhập */
  required?: boolean;
}

/**
 * IzFormInput (Hàng xịn ERP)
 * Tự động nói chuyện với React-Hook-Form & Zod qua Context.
 * Tự bắt lỗi validation, tự render Label, tự tô đỏ viền, từ chối nhận ref từ ngoài.
 */
export function IzFormInput({ name, label, required, ...inputProps }: IzFormInputProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('IzFormInput bắt buộc phải được bọc trong <IzForm> (hoặc <FormProvider> của r-h-f).');
  }

  const { control } = context;

  return (
    <IzErrorBoundary fallback={<div className="text-red-500 text-sm">⚠️ Form Input Error</div>}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const errorMessage = fieldState.error?.message;
          const hasError = !!errorMessage;

          return (
            <div className={styles.wrapper}>
              {label && (
                <label 
                  htmlFor={name} 
                  className={`${styles.label} ${required ? styles.required : ''}`}
                >
                  {label}
                </label>
              )}
              
              <IzInput
                id={name}
                error={hasError}
                {...field}
                {...inputProps}
                value={field.value ?? ''} // Chặn warning React "A component is changing an uncontrolled input to be controlled"
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
