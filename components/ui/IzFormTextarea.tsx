'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { IzTextarea, IzTextareaProps } from './IzTextarea';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzFormTextareaProps extends IzTextareaProps {
  name: string;
}

export function IzFormTextarea({ name, ...props }: IzFormTextareaProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('IzFormTextarea bắt buộc phải được bọc trong <IzForm>.');
  }

  return (
    <IzErrorBoundary fallback={<div className="text-red-500 text-sm">⚠️ Form Textarea Error</div>}>
      <Controller
        name={name}
        control={context.control}
        render={({ field, fieldState }) => (
          <IzTextarea
            id={name}
            error={fieldState.error?.message}
            {...field}
            {...props}
            value={field.value ?? ''}
          />
        )}
      />
    </IzErrorBoundary>
  );
}
