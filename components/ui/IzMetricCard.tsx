import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './IzMetricCard.module.scss';

interface IzMetricCardProps {
  label: string;
  value: string | number;
  trend?: number; // positive = up, negative = down, 0 = neutral
  trendLabel?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function IzMetricCard({
  label,
  value,
  trend,
  trendLabel,
  description,
  icon,
  className,
  style,
}: IzMetricCardProps) {
  const trendClass =
    trend === undefined
      ? ''
      : trend > 0
      ? styles.trendUp
      : trend < 0
      ? styles.trendDown
      : styles.trendNeutral;

  const TrendIcon =
    trend === undefined
      ? null
      : trend > 0
      ? TrendingUp
      : trend < 0
      ? TrendingDown
      : Minus;

  return (
    <div className={clsx(styles.card, className)} style={style}>
      {icon && <div className={styles.iconBox}>{icon}</div>}
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {trend !== undefined && (
        <span className={clsx(styles.trend, trendClass)}>
          {TrendIcon && <TrendIcon size={14} />}
          {trend > 0 ? '+' : ''}{trend}%
          {trendLabel && ` ${trendLabel}`}
        </span>
      )}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
