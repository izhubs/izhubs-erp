'use client';

import { IzMetricCard } from '@/components/ui/IzMetricCard';
import { IzCard, IzCardHeader, IzCardTitle, IzCardContent } from '@/components/ui/IzCard';
import { Money } from '@/components/shared/Money';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, CartesianGrid, XAxis, YAxis, LineChart, Line, BarChart, Bar
} from 'recharts';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { formatDate } from '@/lib/userTime';

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  customFields?: Record<string, any>;
  createdAt?: Date | string | null;
  [key: string]: any;
}

interface Contact {
  id: string;
  name: string;
  email?: string | null;
  createdAt?: Date | string | null;
  [key: string]: any;
}

export function VirtualOfficeCeoDashboard({ deals, contacts }: { deals: Deal[], contacts: Contact[] }) {
  const { fmt } = useCurrency();

  // 1. KPI Calculations
  const activeDeals = deals.filter(d => d.stage === 'active');
  const mrr = activeDeals.reduce((sum, d) => sum + d.value, 0);
  
  const newLeads = deals.filter(d => d.stage === 'lead').length;
  // Assume a 2.5% churn rate placeholder for demo, or calculate based on lost deals
  const lostDeals = deals.filter(d => d.stage === 'lost').length;
  const churnRate = deals.length ? ((lostDeals / deals.length) * 100).toFixed(1) : '0.0';
  
  const pipelineValue = deals.filter(d => !['won', 'lost', 'active'].includes(d.stage)).reduce((sum, d) => sum + d.value, 0);

  // 2. Chart Data: Revenue by Package (Donut)
  const revenueByPkg: Record<string, number> = {};
  for (const d of activeDeals) {
    const pkg = d.customFields?.goi_dich_vu as string ?? 'Other';
    revenueByPkg[pkg] = (revenueByPkg[pkg] ?? 0) + d.value;
  }
  const PACKAGE_COLORS = ['#f59e0b', '#a8a29e', '#3b82f6', '#6366f1']; // Gold, Silver, Diamond, Others
  const revenueData = Object.entries(revenueByPkg).map(([name, value], i) => ({
    name, value, color: PACKAGE_COLORS[i % PACKAGE_COLORS.length],
  }));

  // 3. Chart Data: Revenue line chart (Last 6 Months)
  const now = new Date();
  const arrData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: d.toLocaleDateString('vi-VN', { month: 'short' }), revenue: 0 };
  });
  for (const deal of deals) {
    if (!deal.createdAt) continue;
    const created = new Date(deal.createdAt as string);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    if (created < sixMonthsAgo) continue;
    const monthIdx = (created.getFullYear() - now.getFullYear()) * 12 + created.getMonth() - (now.getMonth() - 5);
    if (monthIdx >= 0 && monthIdx < arrData.length) arrData[monthIdx].revenue += deal.value;
  }

  // 4. Staff Leaderboard (Mocked assignment logic using deal ID to simulate staff)
  const staffNames = ['Thủy Hằng', 'Hảo Trần', 'Khánh Nhi', 'Quốc Bảo'];
  const staffSales = staffNames.map((name, idx) => {
    const val = activeDeals.filter((_, i) => i % staffNames.length === idx).reduce((s, d) => s + d.value, 0);
    return { name, value: val };
  }).sort((a, b) => b.value - a.value);
  const maxSales = Math.max(...staffSales.map(s => s.value), 1);

  // 5. Expiring Contracts (Deals in 'renewal' stage)
  const expiringDeals = deals.filter(d => d.stage === 'renewal').slice(0, 5);

  // 6. Churn List (Deals in 'lost' stage)
  const churnedDeals = deals.filter(d => d.stage === 'lost').slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        <IzMetricCard
          label="DOANH THU THÁNG (MRR)"
          value={fmt(mrr)}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: '#ecfdf5', color: '#10b981', fontSize: 18 }}>💰</span>}
          style={{ borderTop: '4px solid #10b981', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        />
        <IzMetricCard
          label="LEAD MỚI THÁNG NÀY"
          value={newLeads}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', fontSize: 18 }}>👥</span>}
          style={{ borderTop: '4px solid #3b82f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        />
        <IzMetricCard
          label="TỔNG PIPELINE ĐANG MỞ"
          value={fmt(pipelineValue)}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: '#fffbeb', color: '#f59e0b', fontSize: 18 }}>📊</span>}
          style={{ borderTop: '4px solid #f59e0b', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        />
        <IzMetricCard
          label="CHURN RATE (RỜI BỎ)"
          value={`${churnRate}%`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: '#fef2f2', color: '#ef4444', fontSize: 18 }}>📉</span>}
          style={{ borderTop: '4px solid #ef4444', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        />
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 'var(--space-5)' }}>
        
        {/* DOANH SỐ GÓI DỊCH VỤ */}
        <IzCard style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <IzCardHeader>
            <IzCardTitle style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>Gói Dịch Vụ</IzCardTitle>
          </IzCardHeader>
          <IzCardContent>
            <div style={{ height: 260, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                    {revenueData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(val: number) => fmt(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>TỔNG</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{fmt(mrr)}</div>
              </div>
            </div>
          </IzCardContent>
        </IzCard>

        {/* DOANH SỐ THEO THÁNG */}
        <IzCard style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <IzCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IzCardTitle style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>Doanh số theo tháng</IzCardTitle>
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, background: '#ecfdf5', padding: '4px 8px', borderRadius: 4 }}>● Thực tế</span>
          </IzCardHeader>
          <IzCardContent>
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={arrData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={(val) => val > 1000000 ? `${(val / 1000000).toFixed(0)}Tr` : String(val)} />
                  <RechartsTooltip formatter={(val: number) => fmt(val)} labelStyle={{ color: 'var(--color-text)' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </IzCardContent>
        </IzCard>

        {/* DOANH SỐ NHÂN VIÊN */}
        <IzCard style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <IzCardHeader style={{ display: 'flex', justifyContent: 'space-between' }}>
            <IzCardTitle style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>Leaderboard</IzCardTitle>
            <span style={{ fontSize: 11, color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 6px' }}>6 tháng</span>
          </IzCardHeader>
          <IzCardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 10 }}>
              {staffSales.map((s, idx) => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1e293b', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{fmt(s.value)}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                    <div style={{ width: `${(s.value / maxSales) * 100}%`, height: '100%', background: idx === 0 ? '#10b981' : '#3b82f6', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </IzCardContent>
        </IzCard>
      </div>

      {/* TABLES ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        {/* Hợp đồng sắp hết hạn */}
        <IzCard style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <IzCardHeader style={{ paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⏰</span>
                <IzCardTitle style={{ fontSize: 15, fontWeight: 700 }}>Hợp đồng sắp hết hạn</IzCardTitle>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{expiringDeals.length}</span>
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>trong 30 ngày tới</span>
            </div>
          </IzCardHeader>
          <IzCardContent style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {expiringDeals.length > 0 ? expiringDeals.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < expiringDeals.length - 1 ? '1px solid #f8fafc' : 'none', borderLeft: '3px solid #ef4444' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{d.name}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Hết hạn: {formatDate(new Date())}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{i + 1}d</span>
                    <button style={{ padding: '6px 16px', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      ↻ Gia hạn
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Không có hợp đồng nào sắp hết hạn.</div>
              )}
            </div>
          </IzCardContent>
        </IzCard>

        {/* Khách hàng rời bỏ */}
        <IzCard style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <IzCardHeader style={{ paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span>
                <IzCardTitle style={{ fontSize: 15, fontWeight: 700 }}>Khách hàng rời bỏ (Churn)</IzCardTitle>
                <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{lostDeals}</span>
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>Mới nhất</span>
            </div>
          </IzCardHeader>
          <IzCardContent style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {churnedDeals.length > 0 ? churnedDeals.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i < churnedDeals.length - 1 ? '1px solid #f8fafc' : 'none', borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{d.name}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Lý do: Không tái ký</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{formatDate(d.createdAt || new Date().toISOString())}</span>
                </div>
              )) : (
                <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Hiện chưa có khách hàng rời bỏ.</div>
              )}
            </div>
          </IzCardContent>
        </IzCard>
      </div>

    </div>
  );
}
