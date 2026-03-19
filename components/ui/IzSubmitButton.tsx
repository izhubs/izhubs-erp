'use client';

import React, { forwardRef } from 'react';
import { IzButton, IzButtonProps } from './IzButton';
import { useFormContext } from 'react-hook-form';

export const IzSubmitButton = forwardRef<HTMLButtonElement, IzButtonProps>(
  (props, ref) => {
    const context = useFormContext(); 
    // If not inside a React Hook Form context, this will be null
    const isSubmitting = context?.formState?.isSubmitting || false;

    return (
      <IzButton
        ref={ref}
        type="submit"
        isLoading={props.isLoading || isSubmitting}
        {...props}
      />
    );
  }
);

IzSubmitButton.displayName = 'IzSubmitButton';
