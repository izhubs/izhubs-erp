'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { IzCheckbox, IzCheckboxProps } from './IzCheckbox';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzFormCheckboxProps extends IzCheckboxProps {
  name: string;
}

export function IzFormCheckbox({ name, ...props }: IzFormCheckboxProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('IzFormCheckbox bắt buộc phải được bọc trong <IzForm>.');
  }

  return (
    <IzErrorBoundary fallback={<div className="text-red-500 text-sm">⚠️ Form Checkbox Error</div>}>
      <Controller
        name={name}
        control={context.control}
        render={({ field, fieldState }) => (
          <IzCheckbox
            id={name}
            error={fieldState.error?.message}
            checked={!!field.value} // Crucial for checkboxes
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            {...props}
          />
        )}
      />
    </IzErrorBoundary>
  );
}
