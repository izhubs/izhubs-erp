'use client';

import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useCurrency } from '@/lib/hooks/useCurrency';

export interface SummaryCardProps {
  id: string;
  title?: string;
  value?: number | string;
  icon?: string;
  trend?: number;
  trendLabel?: string;
  format?: 'number' | 'currency' | 'percent';
  isLoading?: boolean;
}

export function SummaryCardWidget({
  title,
  value,
  trend,
  trendLabel,
  format = 'number',
  isLoading
}: SummaryCardProps) {
  const { fmt } = useCurrency();

  if (isLoading) {
    return (
      <div className="card p-4 skeleton-container animate-pulse" style={{ height: '120px' }}>
        <div className="skeleton h-4 w-1/3 mb-2 rounded"></div>
        <div className="skeleton h-8 w-1/2 mb-4 rounded"></div>
        <div className="skeleton h-3 w-1/4 rounded"></div>
      </div>
    );
  }

  const formattedValue = format === 'currency'
    ? fmt(value)
    : format === 'percent'
    ? `${value}%`
    : new Intl.NumberFormat('en-US').format(Number(value) || 0);


  const isPositive = (trend ?? 0) >= 0;

  return (
    <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0 }}>
          {title || 'Metric'}
        </h3>
        <span style={{ color: 'var(--color-text-lighter)' }}>
          <Activity size={18} />
        </span>
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, lineHeight: 1, color: 'var(--color-text)' }}>
          {formattedValue}
        </span>
      </div>

      {trend !== undefined && (
        <div style={{ 
          marginTop: 'var(--space-3)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-1)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 500,
          color: isPositive ? 'var(--color-success)' : 'var(--color-danger)'
        }}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 4 }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
