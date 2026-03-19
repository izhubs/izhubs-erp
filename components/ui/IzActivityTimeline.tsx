import * as React from 'react';
import { clsx } from 'clsx';
import styles from './IzActivityTimeline.module.scss';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}

interface IzActivityTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function IzActivityTimeline({ events, className }: IzActivityTimelineProps) {
  return (
    <ol className={clsx(styles.list, className)}>
      {events.map((event, index) => (
        <li key={event.id} className={styles.item}>
          <div
            className={clsx(
              styles.dot,
              event.variant === 'success' && styles.dotSuccess,
              event.variant === 'destructive' && styles.dotDestructive,
              event.variant === 'warning' && styles.dotWarning,
            )}
          >
            {event.icon}
          </div>
          {index < events.length - 1 && <div className={styles.line} />}
          <div className={styles.content}>
            <div className={styles.header}>
              <p className={styles.title}>{event.title}</p>
              <time className={styles.time}>{event.timestamp}</time>
            </div>
            {event.description && (
              <p className={styles.description}>{event.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
