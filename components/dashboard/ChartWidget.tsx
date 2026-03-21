'use client';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

export interface ChartWidgetProps {
  id: string;
  title?: string;
  type: 'line' | 'bar' | 'donut';
  data: any[];
  xKey?: string;
  yKeys?: string[];
  colors?: string[];
  isLoading?: boolean;
}

const DEFAULT_COLORS = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-accent)'];

export function ChartWidget({
  title,
  type,
  data,
  xKey = 'name',
  yKeys = ['value'],
  colors = DEFAULT_COLORS,
  isLoading
}: ChartWidgetProps) {
  if (isLoading) {
    return (
      <div className="card p-4 skeleton-container animate-pulse" style={{ height: '300px' }}>
        <div className="skeleton h-5 w-1/4 mb-6 rounded"></div>
        <div className="skeleton h-full w-full rounded" style={{ opacity: 0.5 }}></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 'var(--space-4)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
              <XAxis dataKey={xKey} stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }} 
                itemStyle={{ color: 'var(--color-text)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {yKeys.map((key, i) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[i % colors.length]} 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                  animationDuration={1500}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
              <XAxis dataKey={xKey} stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                cursor={{ fill: 'var(--color-bg-hover)', opacity: 0.4 }}
                contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {yKeys.map((key, i) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={colors[i % colors.length]} 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)', borderRadius: 'var(--radius-md)' }} 
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Pie
                data={data}
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={5}
                dataKey={yKeys[0]}
                nameKey={xKey}
                animationDuration={1500}
                stroke="var(--color-bg-base)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card" style={{ padding: 'var(--space-4)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
          {title}
        </h3>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>
        {renderChart()}
      </div>
    </div>
  );
}
