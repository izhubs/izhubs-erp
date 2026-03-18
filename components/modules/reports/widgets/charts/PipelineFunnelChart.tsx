'use client';

// =============================================================
// izhubs ERP — Pipeline Funnel Chart (chart.pipeline_funnel)
// Horizontal BarChart: Deals count + value per stage.
// Docs: use horizontal BarChart for pipeline stage distribution.
// NOT a FunnelChart component (those require recharts v2.5+).
// =============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  stage: string;  // stage label
  count: number;
  value: number;
}

interface PipelineFunnelChartProps {
  data: DataPoint[];
}

export default function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-subtle)', fontSize: 'var(--font-size-sm)' }}>
        Không có deals đang open
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="stage"
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
            color: 'var(--color-text)',
          }}
          formatter={(v: number, name: string) => [
            name === 'count' ? `${v} deals` : `${v.toLocaleString('vi-VN')}đ`,
            name === 'count' ? 'Số deals' : 'Tổng giá trị',
          ]}
        />
        <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  );
}
