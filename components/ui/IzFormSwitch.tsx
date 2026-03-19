'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { IzSwitch, IzSwitchProps } from './IzSwitch';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzFormSwitchProps extends IzSwitchProps {
  name: string;
}

export function IzFormSwitch({ name, ...props }: IzFormSwitchProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('IzFormSwitch bắt buộc phải được bọc trong <IzForm>.');
  }

  return (
    <IzErrorBoundary fallback={<div className="text-red-500 text-sm">⚠️ Form Switch Error</div>}>
      <Controller
        name={name}
        control={context.control}
        render={({ field, fieldState }) => (
          <IzSwitch
            id={name}
            error={fieldState.error?.message}
            checked={!!field.value}
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
