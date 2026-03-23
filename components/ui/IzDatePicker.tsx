import React, { forwardRef } from 'react';
import { IzInput, IzInputProps } from './IzInput';

export type IzDatePickerProps = Omit<IzInputProps, 'type'>;

const IzDatePicker = forwardRef<HTMLInputElement, IzDatePickerProps>(
  (props, ref) => {
    return (
      <IzInput 
        type="date" 
        ref={ref} 
        {...props} 
        /* The native calendar icon is perfectly functional on modern browsers.
           Any custom CSS overrides for webkit-calendar-picker-indicator 
           would be placed in IzInput.module.scss */
      />
    );
  }
);
IzDatePicker.displayName = 'IzDatePicker';

export { IzDatePicker };
