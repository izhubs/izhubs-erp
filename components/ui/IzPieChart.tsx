'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface IzPieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  donut?: boolean;
  className?: string;
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

export function IzPieChart({ data, height = 300, donut = false, className }: IzPieChartProps) {
  const innerRadius = donut ? '55%' : 0;
  const outerRadius = '75%';

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={donut ? 3 : 0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface, #fff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '0.75rem' }}
          formatter={(value) => <span style={{ color: 'var(--color-foreground)' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
