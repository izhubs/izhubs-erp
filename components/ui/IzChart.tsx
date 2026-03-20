'use client';

import React from 'react';
import styles from './IzChart.module.scss';
import type { TooltipProps } from 'recharts';

export interface IzChartTooltipProps extends TooltipProps<number | string, string> {
  /** Text to prepend to the value */
  valuePrefix?: string;
  /** Text to append to the value */
  valueSuffix?: string;
  /** Custom formatter for the top label */
  labelFormatter?: (label: any) => React.ReactNode;
  /** Optional custom mapping for completely renaming keys (e.g. { arr: 'Doanh thu' }) */
  nameMap?: Record<string, string>;
}

/**
 * Premium custom tooltip for Recharts.
 * Provides Glassmorphism background, bold values, and elegant dot alignment.
 */
export function IzChartTooltip({ 
  active, 
  payload, 
  label, 
  valuePrefix = '', 
  valueSuffix = '', 
  labelFormatter, 
  nameMap = {} 
}: IzChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>
        {labelFormatter ? labelFormatter(label) : label}
      </div>
      {payload.map((entry, index) => {
        // Resolve name via explicit map, or fallback to the entry name or dataKey
        const rawName = entry.name ?? entry.dataKey ?? 'Value';
        const displayName = nameMap[String(rawName)] || rawName;

        return (
          <div key={`item-${index}`} className={styles.tooltipItem}>
            <div className={styles.tooltipItemLeft}>
              <span
                className={styles.tooltipDot}
                style={{ backgroundColor: entry.color || entry.stroke || 'var(--color-primary)' }}
              />
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{displayName}:</span>
            </div>
            <span>
              {valuePrefix}
              {typeof entry.value === 'number' ? entry.value.toLocaleString('vi-VN') : entry.value}
              {valueSuffix}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Renders a standard SVG gradient that Recharts Area elements can reference.
 * Usage: <IzChartGradient id="myGradient" color="var(--color-primary)" />
 * Then in Area: fill="url(#myGradient)"
 */
export function IzChartGradient({ id, color = 'var(--color-primary)' }: { id: string; color?: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={color} stopOpacity={0.35} />
        <stop offset="95%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

/**
 * A standard legend formatter helper to inject proper styling and spacing.
 */
export function izChartLegendFormatter(value: string) {
  return (
    <span style={{ fontSize: '13px', color: 'var(--color-text)', fontWeight: 500, marginLeft: 4 }}>
      {value}
    </span>
  );
}
