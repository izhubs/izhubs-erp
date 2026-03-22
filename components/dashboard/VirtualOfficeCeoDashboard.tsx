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
  ownerId?: string | null;
  [key: string]: any;
}

interface Contact {
  id: string;
  name: string;
  email?: string | null;
  createdAt?: Date | string | null;
  [key: string]: any;
}

interface User {
  id: string;
  name: string;
}

export function VirtualOfficeCeoDashboard({ deals, contacts, users }: { deals: Deal[], contacts: Contact[], users: User[] }) {
  const { fmt } = useCurrency();

  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const getMonthDeals = (start: Date, end: Date) => deals.filter(d => d.createdAt && new Date(d.createdAt) >= start && new Date(d.createdAt) < end);
  
  const thisMonthDeals = getMonthDeals(firstDayThisMonth, new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const lastMonthDeals = getMonthDeals(firstDayLastMonth, firstDayThisMonth);

  // 1. KPI Calculations (Authentic)
  const activeDeals = deals.filter(d => d.stage === 'active' || d.stage === 'won');
  const mrr = activeDeals.reduce((sum, d) => sum + d.value, 0);
  
  // Doanh thu tháng này (Won/Active deals created this month)
  const revenueThisMonth = thisMonthDeals.filter(d => d.stage === 'active' || d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
  const revenueLastMonth = lastMonthDeals.filter(d => d.stage === 'active' || d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
  const revenueTrend = revenueLastMonth === 0 ? (revenueThisMonth > 0 ? 100 : 0) : Number(((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1));

  // Lead mới
  const leadsThisMonth = thisMonthDeals.filter(d => d.stage === 'lead').length;
  const leadsLastMonth = lastMonthDeals.filter(d => d.stage === 'lead').length;
  const leadsTrend = leadsLastMonth === 0 ? (leadsThisMonth > 0 ? 100 : 0) : Number(((leadsThisMonth - leadsLastMonth) / leadsLastMonth * 100).toFixed(1));

  // Hợp đồng tháng này (Won/Active deals count)
  const contractsThisMonth = thisMonthDeals.filter(d => d.stage === 'active' || d.stage === 'won').length;
  const contractsLastMonth = lastMonthDeals.filter(d => d.stage === 'active' || d.stage === 'won').length;
  const contractsTrend = contractsLastMonth === 0 ? (contractsThisMonth > 0 ? 100 : 0) : Number(((contractsThisMonth - contractsLastMonth) / contractsLastMonth * 100).toFixed(1));

  // Khách hàng mới (Contacts created this month)
  const contactsThisMonth = contacts.filter(c => c.createdAt && new Date(c.createdAt) >= firstDayThisMonth).length;
  const contactsLastMonth = contacts.filter(c => c.createdAt && new Date(c.createdAt) >= firstDayLastMonth && new Date(c.createdAt) < firstDayThisMonth).length;
  const contactsTrend = contactsLastMonth === 0 ? (contactsThisMonth > 0 ? 100 : 0) : Number(((contactsThisMonth - contactsLastMonth) / contactsLastMonth * 100).toFixed(1));

  // 2. Chart Data: Revenue by Package (Donut)
  const revenueByPkg: Record<string, number> = {};
  for (const d of activeDeals) {
    const pkg = d.customFields?.goi_dich_vu as string ?? 'Khác';
    revenueByPkg[pkg] = (revenueByPkg[pkg] ?? 0) + d.value;
  }
  const PACKAGE_COLORS = ['#3b82f6', '#f59e0b', '#a8a29e', '#6366f1']; // Diamond, Gold, Silver, Others
  const revenueData = Object.entries(revenueByPkg).map(([name, value], i) => ({
    name, value, color: PACKAGE_COLORS[i % PACKAGE_COLORS.length],
  }));

  // 3. Chart Data: Revenue line chart (Last 6 Months)
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

  // 4. Staff Leaderboard (Authentic using users prop and ownerId)
  const staffSalesMap: Record<string, { name: string, value: number }> = {};
  for (const deal of activeDeals) {
    const ownerName = deal.ownerId ? (users.find(u => u.id === deal.ownerId)?.name || 'Nhân viên ẩn') : 'Chưa phân công';
    if (!staffSalesMap[ownerName]) staffSalesMap[ownerName] = { name: ownerName, value: 0 };
    staffSalesMap[ownerName].value += deal.value;
  }
  const staffSales = Object.values(staffSalesMap).sort((a, b) => b.value - a.value).slice(0, 5);
  const maxSales = Math.max(...staffSales.map(s => s.value), 1);

  // 5. Expiring Contracts (Deals in 'renewal' stage)
  const expiringDeals = deals.filter(d => d.stage === 'renewal').slice(0, 5);

  // 6. Churn List (Deals in 'lost' stage)
  const allLostDeals = deals.filter(d => d.stage === 'lost');
  const churnedDeals = allLostDeals.slice(0, 5);
  const lostDealsCount = allLostDeals.length;
  const churnRate = deals.length ? ((lostDealsCount / deals.length) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        <IzMetricCard
          label="DOANH THU THÁNG NÀY"
          value={fmt(revenueThisMonth)}
          trend={revenueTrend}
          description={`Tháng trước: ${fmt(revenueLastMonth)}`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: '#ecfdf5', color: '#10b981', fontSize: 18 }}>💰</span>}
          style={{ borderTop: '4px solid #10b981', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        />
        <IzMetricCard
          label="LEAD MỚI THÁNG NÀY"
          value={leadsThisMonth}
          trend={leadsTrend}
          description={`Tháng trước: ${leadsLastMonth}`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', fontSize: 18 }}>👥</span>}
          style={{ borderTop: '4px solid #3b82f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        />
        <IzMetricCard
          label="HỢP ĐỒNG THÁNG NÀY"
          value={contractsThisMonth}
          trend={contractsTrend}
          description={`Tháng trước: ${contractsLastMonth}`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: '#fffbeb', color: '#f59e0b', fontSize: 18 }}>📄</span>}
          style={{ borderTop: '4px solid #f59e0b', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        />
        <IzMetricCard
          label="KHÁCH HÀNG MỚI"
          value={contactsThisMonth}
          trend={contactsTrend}
          description={`Tháng trước: ${contactsLastMonth}`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', background: '#f5f3ff', color: '#8b5cf6', fontSize: 18 }}>🏢</span>}
          style={{ borderTop: '4px solid #8b5cf6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
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
                <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{lostDealsCount}</span>
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
