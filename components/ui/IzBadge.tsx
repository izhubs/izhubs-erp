import React from 'react';
import styles from './IzBadge.module.scss';

export type IzBadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'neutral' | 'purple';

export interface IzBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: IzBadgeVariant;
  /** Add dot before text (e.g. for active status) */
  dot?: boolean;
}

const cx = (...args: any[]) => args.filter(Boolean).join(' ');

/**
 * IzBadge: Dùng để dán nhãn trạng thái (Status, Role, Tags...) trong ERP.
 * Hỗ trợ màu sắc theo variant và tùy chọn có dấu chấm nhấp nháy.
 */
export const IzBadge = React.forwardRef<HTMLSpanElement, IzBadgeProps>(
  ({ className, variant = 'default', dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cx(styles.badge, styles[variant], className)}
        {...props}
      >
        {dot && <span className={cx(styles.dot, styles[`dot_${variant}`])} />}
        {children}
      </span>
    );
  }
);

IzBadge.displayName = 'IzBadge';
