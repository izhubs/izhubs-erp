import * as React from 'react';
import { clsx } from 'clsx';
import styles from './IzCard.module.scss';

const IzCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.card, className)} {...props} />
  )
);
IzCard.displayName = 'IzCard';

const IzCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.header, className)} {...props} />
  )
);
IzCardHeader.displayName = 'IzCardHeader';

const IzCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={clsx(styles.title, className)} {...props} />
  )
);
IzCardTitle.displayName = 'IzCardTitle';

const IzCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={clsx(styles.description, className)} {...props} />
  )
);
IzCardDescription.displayName = 'IzCardDescription';

const IzCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.content, className)} {...props} />
  )
);
IzCardContent.displayName = 'IzCardContent';

const IzCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx(styles.footer, className)} {...props} />
  )
);
IzCardFooter.displayName = 'IzCardFooter';

export { IzCard, IzCardHeader, IzCardFooter, IzCardTitle, IzCardDescription, IzCardContent };
