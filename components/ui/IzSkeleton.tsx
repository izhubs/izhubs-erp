import React from 'react';
import styles from './IzSkeleton.module.scss';

export interface IzSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: 'rect' | 'circle' | 'text';
}

const cx = (...args: any[]) => args.filter(Boolean).join(' ');

/**
 * IzSkeleton: Placeholder nhấp nháy khi dữ liệu đang load (đặc biệt hữu ích cho Table Cells và Profile).
 */
export const IzSkeleton = React.forwardRef<HTMLDivElement, IzSkeletonProps>(
  ({ className, shape = 'rect', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cx(styles.skeleton, styles[shape], className)}
        {...props}
      />
    );
  }
);

IzSkeleton.displayName = 'IzSkeleton';
