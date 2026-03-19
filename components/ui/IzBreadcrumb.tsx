import * as React from 'react';
import { clsx } from 'clsx';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import styles from './IzBreadcrumb.module.scss';

const IzBreadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'>
>(({ className, ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" className={clsx(styles.nav, className)} {...props} />
));
IzBreadcrumb.displayName = 'IzBreadcrumb';

const IzBreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol ref={ref} className={clsx(styles.list, className)} {...props} />
));
IzBreadcrumbList.displayName = 'IzBreadcrumbList';

const IzBreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={clsx(styles.item, className)} {...props} />
));
IzBreadcrumbItem.displayName = 'IzBreadcrumbItem';

const IzBreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & { asChild?: boolean }
>(({ className, children, ...props }, ref) => {
  return (
    <a ref={ref} className={clsx(styles.link, className)} {...props}>
      {children}
    </a>
  );
});
IzBreadcrumbLink.displayName = 'IzBreadcrumbLink';

const IzBreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={clsx(styles.page, className)}
    {...props}
  />
));
IzBreadcrumbPage.displayName = 'IzBreadcrumbPage';

const IzBreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={clsx(styles.separator, className)}
    {...props}
  >
    {children ?? <ChevronRight size={16} />}
  </li>
);
IzBreadcrumbSeparator.displayName = 'IzBreadcrumbSeparator';

const IzBreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={clsx(styles.ellipsis, className)}
    {...props}
  >
    <MoreHorizontal size={16} />
  </span>
);
IzBreadcrumbEllipsis.displayName = 'IzBreadcrumbEllipsis';

export {
  IzBreadcrumb,
  IzBreadcrumbList,
  IzBreadcrumbItem,
  IzBreadcrumbLink,
  IzBreadcrumbPage,
  IzBreadcrumbSeparator,
  IzBreadcrumbEllipsis,
};
