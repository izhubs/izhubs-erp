'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './IzModal.module.scss';

const IzModal = DialogPrimitive.Root;

const IzModalTrigger = DialogPrimitive.Trigger;

const IzModalPortal = DialogPrimitive.Portal;

const IzModalClose = DialogPrimitive.Close;

const IzModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={clsx(styles.overlay, className)}
    {...props}
  />
));
IzModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface IzModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
}

const IzModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  IzModalContentProps
>(({ className, children, size = 'md', hideCloseButton, ...props }, ref) => {
  const sizeClass = {
    sm: styles['size-sm'],
    md: styles['size-md'],
    lg: styles['size-lg'],
    xl: styles['size-xl'],
    full: styles['size-full'],
  }[size];

  return (
    <IzModalPortal>
      <IzModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={clsx(styles.content, sizeClass, className)}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close className={styles.closeButton} aria-label="Đóng bảng">
            <X size={18} />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </IzModalPortal>
  );
});
IzModalContent.displayName = DialogPrimitive.Content.displayName;

const IzModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles.header, className)} {...props} />
);
IzModalHeader.displayName = 'IzModalHeader';

const IzModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles.body, className)} {...props} />
);
IzModalBody.displayName = 'IzModalBody';

const IzModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(styles.footer, className)} {...props} />
);
IzModalFooter.displayName = 'IzModalFooter';

const IzModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={clsx(styles.title, className)}
    {...props}
  />
));
IzModalTitle.displayName = DialogPrimitive.Title.displayName;

const IzModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={clsx(styles.description, className)}
    {...props}
  />
));
IzModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  IzModal,
  IzModalPortal,
  IzModalOverlay,
  IzModalTrigger,
  IzModalClose,
  IzModalContent,
  IzModalHeader,
  IzModalBody,
  IzModalFooter,
  IzModalTitle,
  IzModalDescription,
};
