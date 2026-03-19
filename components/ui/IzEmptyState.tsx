import React from 'react';
import { PackageOpen } from 'lucide-react';
import styles from './IzEmptyState.module.scss';
import { IzButton } from './IzButton';

export interface IzEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const cx = (...args: any[]) => args.filter(Boolean).join(' ');

/**
 * IzEmptyState: Hiển thị trạng thái rỗng cho Table, List, Card...
 */
export const IzEmptyState: React.FC<IzEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cx(styles.container, className)}>
      <div className={styles.iconWrapper}>
        {icon || <PackageOpen size={48} strokeWidth={1} />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <div className={styles.action}>
          <IzButton variant="outline" onClick={onAction}>
            {actionLabel}
          </IzButton>
        </div>
      )}
    </div>
  );
};
