'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { clsx } from 'clsx';
import styles from './IzAvatar.module.scss';

interface IzAvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const IzAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  IzAvatarProps
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClass = {
    sm: styles['size-sm'],
    md: styles['size-md'],
    lg: styles['size-lg'],
    xl: styles['size-xl'],
  }[size];

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={clsx(styles.root, sizeClass, className)}
      {...props}
    />
  );
});
IzAvatar.displayName = AvatarPrimitive.Root.displayName;

const IzAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={clsx(styles.image, className)}
    {...props}
  />
));
IzAvatarImage.displayName = AvatarPrimitive.Image.displayName;

const IzAvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={clsx(styles.fallback, className)}
    {...props}
  />
));
IzAvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { IzAvatar, IzAvatarImage, IzAvatarFallback };
