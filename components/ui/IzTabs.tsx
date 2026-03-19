'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { clsx } from 'clsx';
import styles from './IzTabs.module.scss';

type TabsVariant = 'default' | 'underline';

const TabsContext = React.createContext<TabsVariant>('default');

interface IzTabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: TabsVariant;
}

const IzTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  IzTabsProps
>(({ className, variant = 'default', ...props }, ref) => (
  <TabsContext.Provider value={variant}>
    <TabsPrimitive.Root
      ref={ref}
      className={clsx('w-full', className)} // Usually wrapper expands full width
      {...props}
    />
  </TabsContext.Provider>
));
IzTabs.displayName = TabsPrimitive.Root.displayName;

const IzTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsContext);
  return (
    <TabsPrimitive.List
      ref={ref}
      className={clsx(
        variant === 'underline' ? styles.listUnderline : styles.list,
        className
      )}
      {...props}
    />
  );
});
IzTabsList.displayName = TabsPrimitive.List.displayName;

const IzTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={clsx(
        variant === 'underline' ? styles.triggerUnderline : styles.trigger,
        className
      )}
      {...props}
    />
  );
});
IzTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const IzTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={clsx(styles.content, className)}
    {...props}
  />
));
IzTabsContent.displayName = TabsPrimitive.Content.displayName;

export { IzTabs, IzTabsList, IzTabsTrigger, IzTabsContent };
