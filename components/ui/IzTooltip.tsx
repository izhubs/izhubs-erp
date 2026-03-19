'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';
import styles from './IzTooltip.module.scss';

const IzTooltipProvider = TooltipPrimitive.Provider;

const IzTooltip = TooltipPrimitive.Root;

const IzTooltipTrigger = TooltipPrimitive.Trigger;

const IzTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={clsx(styles.content, className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
IzTooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { IzTooltip, IzTooltipTrigger, IzTooltipContent, IzTooltipProvider };
