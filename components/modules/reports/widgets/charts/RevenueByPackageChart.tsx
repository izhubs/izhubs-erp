'use client';

// =============================================================
// izhubs ERP — Revenue by Package Chart (chart.revenue_by_package)
// Horizontal BarChart: Revenue per service package.
// Horizontal layout chosen because package names can be long.
// =============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataPoint {
  name: string;       // Package name
  revenue: number;    // Monthly revenue (active deals)
  count: number;      // Subscriber count
}

interface RevenueByPackageChartProps {
  data: DataPoint[];
}

// Curated palette that works on dark + light themes
const PALETTE = [
  'var(--color-primary)',
  '#10b981',  // emerald
  '#f59e0b',  // amber
  '#8b5cf6',  // violet
  '#ef4444',  // red
];

export default function RevenueByPackageChart({ data }: RevenueByPackageChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-sm)' }}>
        Chưa có gói dịch vụ nào đang active
      </div>
    );
  }

  const height = Math.max(180, data.length * 52);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => {
            if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
            if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
            return String(v);
          }}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
            color: 'var(--color-text)',
          }}
          formatter={(v: number, _name, props) => [
            `${v.toLocaleString('vi-VN')}đ — ${props.payload.count} khách`,
            'Doanh thu/tháng',
          ]}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((_entry, idx) => (
            <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
