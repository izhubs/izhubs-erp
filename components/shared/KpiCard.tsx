// =============================================================
// izhubs ERP — KpiCard (shim → IzMetricCard)
// Preserves legacy KpiCardProps; delegates to IzMetricCard.
// =============================================================

import React from 'react';
import { IzMetricCard } from '@/components/ui/IzMetricCard';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  subLabel?: React.ReactNode;
  trend?: string;
  trendDirection?: TrendDirection;
  urgent?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/** Convert legacy trend string + direction to IzMetricCard numeric trend */
function toNumericTrend(trend?: string, direction?: TrendDirection): number | undefined {
  if (!trend) return undefined;
  const n = parseFloat(trend.replace(/[^0-9.-]/g, '')) || 0;
  if (direction === 'up') return Math.abs(n);
  if (direction === 'down') return -Math.abs(n);
  return 0;
}

export default function KpiCard({
  label,
  value,
  subLabel,
  trend,
  trendDirection = 'neutral',
  icon,
  onClick,
}: KpiCardProps) {
  return (
    <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <IzMetricCard
        label={label}
        value={value}
        trend={toNumericTrend(trend, trendDirection)}
        trendLabel={typeof subLabel === 'string' ? subLabel : undefined}
        icon={icon}
      />
    </div>
  );
}
