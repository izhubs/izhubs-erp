import React, { forwardRef } from 'react';
import { IzInput, IzInputProps } from './IzInput';

export interface IzDatePickerProps extends Omit<IzInputProps, 'type'> {
  // Can add custom date-specific props here later
}

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
