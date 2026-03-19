'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataKey {
  key: string;
  color?: string;
  name?: string;
}

interface IzLineChartProps {
  data: Record<string, string | number>[];
  dataKeys: DataKey[];
  xAxisKey?: string;
  height?: number;
  className?: string;
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function IzLineChart({
  data,
  dataKeys,
  xAxisKey = 'name',
  height = 300,
  className,
}: IzLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e2e8f0)" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground, #64748b)' }}
          axisLine={{ stroke: 'var(--color-border, #e2e8f0)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground, #64748b)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface, #fff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
        {dataKeys.map((dk, i) => (
          <Line
            key={dk.key}
            type="monotone"
            dataKey={dk.key}
            name={dk.name ?? dk.key}
            stroke={dk.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
