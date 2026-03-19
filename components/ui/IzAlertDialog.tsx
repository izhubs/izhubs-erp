'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { IzButton } from './IzButton';
import styles from './IzModal.module.scss'; // Re-use the flawless Modal SCSS

const IzAlertDialog = DialogPrimitive.Root;

const IzAlertDialogTrigger = DialogPrimitive.Trigger;

const IzAlertDialogPortal = DialogPrimitive.Portal;

const IzAlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={clsx(styles.overlay, className)}
    {...props}
  />
));
IzAlertDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface IzAlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const IzAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  IzAlertDialogContentProps
>(({ className, children, size = 'sm', ...props }, ref) => {
  const sizeClass = {
    sm: styles['size-sm'],
    md: styles['size-md'],
    lg: styles['size-lg'],
    xl: styles['size-xl'],
    full: styles['size-full'],
  }[size];

  return (
    <IzAlertDialogPortal>
      <IzAlertDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={clsx(styles.content, sizeClass, className)}
        // Critical: Prevent closing on outside click or escape
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        {...props}
      >
        {children}
        {/* No close (X) button for Alert Dialogs to force explicit actions */}
      </DialogPrimitive.Content>
    </IzAlertDialogPortal>
  );
});
IzAlertDialogContent.displayName = DialogPrimitive.Content.displayName;

// Header, Title, Description re-used exactly
const IzAlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles.header, className)} {...props} />
);
IzAlertDialogHeader.displayName = 'IzAlertDialogHeader';

const IzAlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={clsx(styles.title, className)}
    {...props}
  />
));
IzAlertDialogTitle.displayName = DialogPrimitive.Title.displayName;

const IzAlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={clsx(styles.description, className)}
    {...props}
  />
));
IzAlertDialogDescription.displayName = DialogPrimitive.Description.displayName;

// Footer specialized for Alert Dialogs
const IzAlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles.footer, className)} {...props} />
);
IzAlertDialogFooter.displayName = 'IzAlertDialogFooter';

// Pre-built Action buttons to speed up dev
const IzAlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close ref={ref} asChild>
    <IzButton variant="outline" className={className} {...props} />
  </DialogPrimitive.Close>
));
IzAlertDialogCancel.displayName = DialogPrimitive.Close.displayName;

const IzAlertDialogAction = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> & {
    variant?: 'default' | 'destructive' | 'secondary' | 'ghost' | 'outline';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <DialogPrimitive.Close ref={ref} asChild>
    <IzButton variant={variant} className={className} {...props} />
  </DialogPrimitive.Close>
));
IzAlertDialogAction.displayName = 'IzAlertDialogAction';

export {
  IzAlertDialog,
  IzAlertDialogTrigger,
  IzAlertDialogContent,
  IzAlertDialogHeader,
  IzAlertDialogFooter,
  IzAlertDialogTitle,
  IzAlertDialogDescription,
  IzAlertDialogAction,
  IzAlertDialogCancel,
};
