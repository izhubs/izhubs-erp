'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './IzSheet.module.scss';

const IzSheet = ({ modal = false, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root modal={modal} {...props} />
);
const IzSheetTrigger = DialogPrimitive.Trigger;
const IzSheetClose = DialogPrimitive.Close;
const IzSheetPortal = DialogPrimitive.Portal;

const IzSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={clsx(styles.overlay, className)}
    {...props}
    ref={ref}
  />
));
IzSheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface IzSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
}

const IzSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  IzSheetContentProps
>(({ className, children, size = 'md', hideCloseButton, ...props }, ref) => {
  const sizeClass = {
    sm: styles['size-sm'],
    md: styles['size-md'],
    lg: styles['size-lg'],
    xl: styles['size-xl'],
    full: styles['size-full'],
  }[size]?.[0] || styles['size-md']; // default md

  return (
    <IzSheetPortal>
      <IzSheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={clsx(styles.content, {
          [styles['size-sm']]: size === 'sm',
          [styles['size-md']]: size === 'md',
          [styles['size-lg']]: size === 'lg',
          [styles['size-xl']]: size === 'xl',
          [styles['size-full']]: size === 'full',
        }, className)}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close className={styles.closeButton}>
            <X size={18} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </IzSheetPortal>
  );
});
IzSheetContent.displayName = DialogPrimitive.Content.displayName;

const IzSheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles.header, className)} {...props} />
);
IzSheetHeader.displayName = 'IzSheetHeader';

const IzSheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles.body, className)} {...props} />
);
IzSheetBody.displayName = 'IzSheetBody';

const IzSheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles.footer, className)} {...props} />
);
IzSheetFooter.displayName = 'IzSheetFooter';

const IzSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={clsx(styles.title, className)}
    {...props}
  />
));
IzSheetTitle.displayName = DialogPrimitive.Title.displayName;

const IzSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={clsx(styles.description, className)}
    {...props}
  />
));
IzSheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  IzSheet,
  IzSheetPortal,
  IzSheetOverlay,
  IzSheetTrigger,
  IzSheetClose,
  IzSheetContent,
  IzSheetHeader,
  IzSheetBody,
  IzSheetFooter,
  IzSheetTitle,
  IzSheetDescription,
};