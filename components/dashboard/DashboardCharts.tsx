'use client';

// =============================================================
// izhubs ERP — Dashboard Charts (Client Component)
// Recharts-based: ARR Line Chart + Revenue Donut
// Receives pre-computed data from server parent
// =============================================================

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { IzCard, IzCardHeader, IzCardTitle, IzCardContent } from '@/components/ui/IzCard';
import { IzChartTooltip, IzChartGradient, izChartLegendFormatter } from '@/components/ui/IzChart';

interface ArrDataPoint { month: string; arr: number }
interface RevenueSlice  { name: string; value: number; color: string }

interface Props {
  arrData: ArrDataPoint[];
  revenueData: RevenueSlice[];
  locale: 'en' | 'vi';
}

function formatVND(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export function DashboardCharts({ arrData, revenueData, locale }: Props) {
  const isVi = locale === 'vi';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-5)' }}>

      {/* ARR Line Chart */}
      <IzCard style={{ position: 'relative' }}>
        <IzCardHeader style={{ paddingBottom: 'var(--space-2)' }}>
          <IzCardTitle style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
            {isVi ? 'Doanh thu theo tháng (VND)' : 'Monthly Revenue (VND)'}
          </IzCardTitle>
        </IzCardHeader>
        <IzCardContent style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={arrData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <IzChartGradient id="colorArr" color="var(--color-primary)" />
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tickFormatter={formatVND}
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false} tickLine={false} width={40}
              />
              <Tooltip
                content={
                  <IzChartTooltip 
                    valueSuffix="đ" 
                    nameMap={{ arr: isVi ? 'Doanh thu' : 'Revenue' }}
                  />
                }
                cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone" dataKey="arr"
                stroke="var(--color-primary)" strokeWidth={3}
                fillOpacity={1} fill="url(#colorArr)"
                activeDot={{ r: 6, fill: 'var(--color-primary)', stroke: 'var(--color-bg-surface)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </IzCardContent>
      </IzCard>

      {/* Revenue Donut */}
      <IzCard>
        <IzCardHeader style={{ paddingBottom: 'var(--space-2)' }}>
          <IzCardTitle style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
            {isVi ? 'Cơ cấu doanh thu' : 'Revenue by Package'}
          </IzCardTitle>
        </IzCardHeader>
        <IzCardContent style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          {revenueData.length === 0 ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              {isVi ? 'Chưa có dữ liệu' : 'No data yet'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="45%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {revenueData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<IzChartTooltip valueSuffix="đ" />}
                />
                <Legend
                  iconType="circle" iconSize={8}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ lineHeight: '24px' }}
                  formatter={izChartLegendFormatter}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </IzCardContent>
      </IzCard>
    </div>
  );
}
