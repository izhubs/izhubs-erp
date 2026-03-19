'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { IzRadioGroup, IzRadioGroupProps } from './IzRadioGroup';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzFormRadioGroupProps extends Omit<IzRadioGroupProps, 'value' | 'onChange'> {
  name: string;
}

export function IzFormRadioGroup({ name, ...props }: IzFormRadioGroupProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('IzFormRadioGroup bắt buộc phải được bọc trong <IzForm>.');
  }

  return (
    <IzErrorBoundary fallback={<div className="text-red-500 text-sm">⚠️ Form RadioGroup Error</div>}>
      <Controller
        name={name}
        control={context.control}
        render={({ field, fieldState }) => (
          <IzRadioGroup
            name={name} // Important for radio grouping behavior
            error={fieldState.error?.message}
            value={field.value}
            onChange={field.onChange}
            ref={field.ref}
            {...props}
          />
        )}
      />
    </IzErrorBoundary>
  );
}
