'use client';

// =============================================================
// izhubs ERP — ARR Trend Widget (chart.arr_trend)
// AreaChart: Revenue trend over last 6 months.
// Lazy-loaded Client Component (no SSR) per docs rule.
// =============================================================

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCurrency } from '@/lib/hooks/useCurrency';

interface DataPoint {
  month: string;   // e.g. "01/2026"
  revenue: number; // in VND
}

interface ArrTrendChartProps {
  data: DataPoint[];
}

export default function ArrTrendChart({ data }: ArrTrendChartProps) {
  const { fmt, fmtCompact } = useCurrency();

  if (data.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-sm)' }}>
        Chưa có dữ liệu doanh thu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="arrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => fmtCompact(v)}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
            color: 'var(--color-text)',
          }}
          formatter={(v: number) => [fmt(v), 'Doanh thu']}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#arrGradient)"
          dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: 'var(--color-primary)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
