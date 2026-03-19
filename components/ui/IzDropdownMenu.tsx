'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';
import { Check, ChevronRight, Circle } from 'lucide-react';

import styles from './IzDropdownMenu.module.scss';

const IzDropdownMenu = DropdownMenuPrimitive.Root;

const IzDropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const IzDropdownMenuGroup = DropdownMenuPrimitive.Group;

const IzDropdownMenuPortal = DropdownMenuPrimitive.Portal;

const IzDropdownMenuSub = DropdownMenuPrimitive.Sub;

const IzDropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const IzDropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={clsx(
      styles.subTrigger, 
      inset && 'pl-8', // utility if needed, normally SCSS handles it
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
IzDropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const IzDropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <IzDropdownMenuPortal>
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={clsx(styles.subContent, className)}
      {...props}
    />
  </IzDropdownMenuPortal>
));
IzDropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const IzDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={clsx(styles.content, className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
IzDropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const IzDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
  }
>(({ className, inset, variant = 'default', ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={clsx(
      styles.item,
      variant === 'destructive' && styles['item-destructive'],
      className
    )}
    {...props}
  />
));
IzDropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const IzDropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={clsx(styles.checkboxItem, className)}
    checked={checked}
    {...props}
  >
    <span className={styles.itemIndicator}>
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
IzDropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const IzDropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={clsx(styles.radioItem, className)}
    {...props}
  >
    <span className={styles.itemIndicator}>
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
IzDropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const IzDropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={clsx(styles.label, className)}
    {...props}
  />
));
IzDropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const IzDropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={clsx(styles.separator, className)}
    {...props}
  />
));
IzDropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const IzDropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={clsx(styles.shortcut, className)}
      {...props}
    />
  );
};
IzDropdownMenuShortcut.displayName = 'IzDropdownMenuShortcut';

export {
  IzDropdownMenu,
  IzDropdownMenuTrigger,
  IzDropdownMenuContent,
  IzDropdownMenuItem,
  IzDropdownMenuCheckboxItem,
  IzDropdownMenuRadioItem,
  IzDropdownMenuLabel,
  IzDropdownMenuSeparator,
  IzDropdownMenuShortcut,
  IzDropdownMenuGroup,
  IzDropdownMenuPortal,
  IzDropdownMenuSub,
  IzDropdownMenuSubContent,
  IzDropdownMenuSubTrigger,
  IzDropdownMenuRadioGroup,
};
