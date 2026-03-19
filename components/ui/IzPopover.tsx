'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import styles from './IzPopover.module.scss';

const IzPopover = PopoverPrimitive.Root;

const IzPopoverTrigger = PopoverPrimitive.Trigger;

const IzPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={clsx(styles.content, className)}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
IzPopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { IzPopover, IzPopoverTrigger, IzPopoverContent };
