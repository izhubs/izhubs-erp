'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './IzAccordion.module.scss';

const IzAccordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root ref={ref} className={clsx(styles.root, className)} {...props} />
));
IzAccordion.displayName = 'IzAccordion';

const IzAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={clsx(styles.item, className)} {...props} />
));
IzAccordionItem.displayName = 'IzAccordionItem';

const IzAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger ref={ref} className={clsx(styles.trigger, className)} {...props}>
      {children}
      <ChevronDown className={styles.icon} />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
IzAccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const IzAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className={clsx(styles.content, className)} {...props}>
    <div className={styles.contentInner}>{children}</div>
  </AccordionPrimitive.Content>
));
IzAccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { IzAccordion, IzAccordionItem, IzAccordionTrigger, IzAccordionContent };
