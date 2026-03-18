// =============================================================
// izhubs ERP — KpiCard
// Self-contained KPI metric card for all dashboards.
// Supports trend indicator, sparkline placeholder, and urgency badge.
// Usage: <KpiCard label="MRR" value="485.000.000đ" trend="+12%" />
// =============================================================

import React from 'react';
import styles from './KpiCard.module.scss';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KpiCardProps {
  /** Metric label, e.g. "MRR (Doanh thu tháng)" */
  label: string;
  /** Primary value to display */
  value: string | number;
  /** Secondary label below value, e.g. "So với 433M tháng trước" */
  subLabel?: string;
  /** Trend text, e.g. "+12%" or "3.2%" */
  trend?: string;
  /** Direction of the trend — controls color */
  trendDirection?: TrendDirection;
  /** When true, renders urgent red badge (e.g. contracts expiring) */
  urgent?: boolean;
  /** Icon name (Lucide) rendered in the card corner */
  icon?: React.ReactNode;
  /** Optional click handler */
  onClick?: () => void;
}

export default function KpiCard({
  label,
  value,
  subLabel,
  trend,
  trendDirection = 'neutral',
  urgent = false,
  icon,
  onClick,
}: KpiCardProps) {
  const trendClass =
    trendDirection === 'up'
      ? styles.trendUp
      : trendDirection === 'down'
      ? styles.trendDown
      : styles.trendNeutral;

  return (
    <div
      className={`${styles.kpiCard} ${urgent ? styles.urgent : ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>

      <div className={styles.value}>{value}</div>

      <div className={styles.footer}>
        {subLabel && <span className={styles.subLabel}>{subLabel}</span>}
        {trend && (
          <span className={`${styles.trend} ${trendClass}`}>
            {trendDirection === 'up' && '↑ '}
            {trendDirection === 'down' && '↓ '}
            {trend}
          </span>
        )}
      </div>

      {urgent && <div className={styles.urgentBar} aria-hidden />}
    </div>
  );
}
