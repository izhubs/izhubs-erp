import * as React from 'react';
import { clsx } from 'clsx';
import styles from './IzKanbanBoard.module.scss';
import { GripVertical } from 'lucide-react';

/* --- BOARD WRAPPER --- */
interface IzKanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const IzKanbanBoard = React.forwardRef<HTMLDivElement, IzKanbanBoardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.board, className)} {...props}>
        {children}
      </div>
    );
  }
);
IzKanbanBoard.displayName = 'IzKanbanBoard';

/* --- COLUMN --- */
interface IzKanbanColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  count?: number;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}
export const IzKanbanColumn = React.forwardRef<HTMLDivElement, IzKanbanColumnProps>(
  ({ title, count, children, className, headerAction, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.column, className)} {...props}>
        <div className={styles.columnHeader}>
          <div className={styles.titleBox}>
            <h3 className={styles.title}>{title}</h3>
            {count !== undefined && <span className={styles.count}>{count}</span>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
        <div className={styles.columnBody}>
          {children}
        </div>
      </div>
    );
  }
);
IzKanbanColumn.displayName = 'IzKanbanColumn';

/* --- CARD --- */
interface IzKanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
}
export const IzKanbanCard = React.forwardRef<HTMLDivElement, IzKanbanCardProps>(
  ({ title, description, footerLeft, footerRight, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.card, className)} {...props}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <GripVertical size={16} style={{ color: 'var(--color-muted-foreground)', marginTop: '2px', cursor: 'grab' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 className={styles.cardTitle}>{title}</h4>
            {description && <p className={styles.cardDescription}>{description}</p>}
          </div>
        </div>
        {(footerLeft || footerRight) && (
          <div className={styles.cardFooter}>
            <div>{footerLeft}</div>
            <div>{footerRight}</div>
          </div>
        )}
      </div>
    );
  }
);
IzKanbanCard.displayName = 'IzKanbanCard';
