'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import styles from './IzToast.module.scss';

const IzToastProvider = ToastPrimitives.Provider;

const IzToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={clsx(styles.viewport, className)}
    {...props}
  />
));
IzToastViewport.displayName = ToastPrimitives.Viewport.displayName;

interface IzToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  variant?: 'default' | 'destructive' | 'success';
}

const IzToast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  IzToastProps
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={clsx(styles.toast, styles[variant], className)}
      {...props}
    />
  );
});
IzToast.displayName = ToastPrimitives.Root.displayName;

const IzToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={clsx(styles.action, className)}
    {...props}
  />
));
IzToastAction.displayName = ToastPrimitives.Action.displayName;

const IzToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={clsx(styles.closeButton, className)}
    toast-close=""
    {...props}
  >
    <X size={16} />
  </ToastPrimitives.Close>
));
IzToastClose.displayName = ToastPrimitives.Close.displayName;

const IzToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={clsx(styles.title, className)}
    {...props}
  />
));
IzToastTitle.displayName = ToastPrimitives.Title.displayName;

const IzToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={clsx(styles.description, className)}
    {...props}
  />
));
IzToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof IzToast>;
type ToastActionElement = React.ReactElement<typeof IzToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  IzToastProvider,
  IzToastViewport,
  IzToast,
  IzToastTitle,
  IzToastDescription,
  IzToastClose,
  IzToastAction,
};
