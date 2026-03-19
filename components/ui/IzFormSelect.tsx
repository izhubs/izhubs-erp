'use client';

import React, { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { IzSelect, IzSelectProps } from './IzSelect';
import { IzErrorBoundary } from './IzErrorBoundary';

export interface IzFormSelectProps extends Omit<IzSelectProps, 'value' | 'onChange'> {
  name: string;
  options: { label: string; value: string | number }[];
}

export function IzFormSelect({ name, options, isMulti, ...props }: IzFormSelectProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('IzFormSelect bắt buộc phải được bọc trong <IzForm>.');
  }

  // Helper to find the full option object(s) given primitive value(s) from RHF
  const getValue = (val: any) => {
    if (isMulti) {
      if (!Array.isArray(val)) return [];
      return options.filter((c) => val.includes(c.value));
    }
    return options.find((c) => c.value === val) || null;
  };

  return (
    <IzErrorBoundary fallback={<div className="text-red-500 text-sm">⚠️ Form Select Error</div>}>
      <Controller
        name={name}
        control={context.control}
        render={({ field, fieldState }) => (
          <IzSelect
            id={name}
            options={options}
            isMulti={isMulti}
            error={fieldState.error?.message}
            value={getValue(field.value)}
            onChange={(selectedOption: any) => {
              if (isMulti) {
                field.onChange(selectedOption ? selectedOption.map((o: any) => o.value) : []);
              } else {
                field.onChange(selectedOption ? selectedOption.value : null);
              }
            }}
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
