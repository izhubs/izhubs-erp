'use client';

import * as React from 'react';
import { Drawer } from 'vaul';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import styles from './IzDrawer.module.scss';

const IzDrawer = ({
  shouldScaleBackground = true,
  direction = 'right',
  ...props
}: React.ComponentProps<typeof Drawer.Root>) => (
  <Drawer.Root
    shouldScaleBackground={shouldScaleBackground}
    direction={direction}
    {...props}
  />
);
IzDrawer.displayName = 'Drawer';

const IzDrawerTrigger = Drawer.Trigger;

const IzDrawerPortal = Drawer.Portal;

const IzDrawerClose = Drawer.Close;

const IzDrawerOverlay = React.forwardRef<
  React.ElementRef<typeof Drawer.Overlay>,
  React.ComponentPropsWithoutRef<typeof Drawer.Overlay>
>(({ className, ...props }, ref) => (
  <Drawer.Overlay
    ref={ref}
    className={clsx(styles.overlay, className)}
    {...props}
  />
));
IzDrawerOverlay.displayName = Drawer.Overlay.displayName;

const IzDrawerContent = React.forwardRef<
  React.ElementRef<typeof Drawer.Content>,
  React.ComponentPropsWithoutRef<typeof Drawer.Content> & { side?: 'right' | 'bottom'; hideCloseButton?: boolean }
>(({ className, children, side = 'right', hideCloseButton = false, ...props }, ref) => (
  <IzDrawerPortal>
    <IzDrawerOverlay />
    <Drawer.Content
      ref={ref}
      className={clsx(
        styles.content,
        side === 'right' ? styles.contentRight : styles.contentBottom,
        className
      )}
      {...props}
    >
      {children}
      {!hideCloseButton && (
        <Drawer.Close className={styles.closeButton} aria-label="Đóng bảng">
          <X size={18} />
        </Drawer.Close>
      )}
    </Drawer.Content>
  </IzDrawerPortal>
));
IzDrawerContent.displayName = 'DrawerContent';

const IzDrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.header, className)} {...props} />
));
IzDrawerHeader.displayName = 'DrawerHeader';

const IzDrawerBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.body, className)} {...props} />
));
IzDrawerBody.displayName = 'DrawerBody';

const IzDrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx(styles.footer, className)} {...props} />
));
IzDrawerFooter.displayName = 'DrawerFooter';

const IzDrawerTitle = React.forwardRef<
  React.ElementRef<typeof Drawer.Title>,
  React.ComponentPropsWithoutRef<typeof Drawer.Title>
>(({ className, ...props }, ref) => (
  <Drawer.Title ref={ref} className={clsx(styles.title, className)} {...props} />
));
IzDrawerTitle.displayName = Drawer.Title.displayName;

const IzDrawerDescription = React.forwardRef<
  React.ElementRef<typeof Drawer.Description>,
  React.ComponentPropsWithoutRef<typeof Drawer.Description>
>(({ className, ...props }, ref) => (
  <Drawer.Description ref={ref} className={clsx(styles.description, className)} {...props} />
));
IzDrawerDescription.displayName = Drawer.Description.displayName;

export {
  IzDrawer,
  IzDrawerPortal,
  IzDrawerOverlay,
  IzDrawerTrigger,
  IzDrawerClose,
  IzDrawerContent,
  IzDrawerHeader,
  IzDrawerBody,
  IzDrawerFooter,
  IzDrawerTitle,
  IzDrawerDescription,
};
