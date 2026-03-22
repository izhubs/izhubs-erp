'use client';

import { useState } from 'react';
import { IzMetricCard } from '@/components/ui/IzMetricCard';
import { IzCard, IzCardHeader, IzCardTitle, IzCardContent, IzCardFooter } from '@/components/ui/IzCard';
import { Money } from '@/components/shared/Money';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, CartesianGrid, XAxis, YAxis, LineChart, Line, BarChart, Bar
} from 'recharts';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { formatDate } from '@/lib/userTime';
import { Download, Bell, Moon, MoreVertical } from 'lucide-react';
import Link from 'next/link';

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
  const [timeFilter, setTimeFilter] = useState<'3' | '6' | '12' | 'all'>('6');

  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const getMonthDeals = (start: Date, end: Date) => deals.filter(d => d.createdAt && new Date(d.createdAt) >= start && new Date(d.createdAt) < end);
  
  const thisMonthDeals = getMonthDeals(firstDayThisMonth, new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const lastMonthDeals = getMonthDeals(firstDayLastMonth, firstDayThisMonth);

  // 1. KPI Calculations (Authentic)
  const activeDeals = deals.filter(d => d.stage === 'active' || d.stage === 'won');
  const mrr = activeDeals.reduce((sum, d) => sum + d.value, 0);
  
  // Doanh thu tháng này
  const revenueThisMonth = thisMonthDeals.filter(d => d.stage === 'active' || d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
  const revenueLastMonth = lastMonthDeals.filter(d => d.stage === 'active' || d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
  const revenueTrend = revenueLastMonth === 0 ? (revenueThisMonth > 0 ? 100 : 0) : Number(((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1));

  // Lead mới
  const leadsThisMonth = thisMonthDeals.filter(d => d.stage === 'lead').length;
  const leadsLastMonth = lastMonthDeals.filter(d => d.stage === 'lead').length;
  const leadsTrend = leadsLastMonth === 0 ? (leadsThisMonth > 0 ? 100 : 0) : Number(((leadsThisMonth - leadsLastMonth) / leadsLastMonth * 100).toFixed(1));

  // Hợp đồng tháng này (Ký mới & Tái ký)
  const wonThisMonth = thisMonthDeals.filter(d => d.stage === 'won');
  const renewalThisMonth = thisMonthDeals.filter(d => d.stage === 'active' || d.customFields?.is_renewal); // Fallback logic
  const contractsThisMonth = wonThisMonth.length + renewalThisMonth.length;
  const contractsLastMonth = lastMonthDeals.filter(d => d.stage === 'active' || d.stage === 'won').length;
  const contractsTrend = contractsLastMonth === 0 ? (contractsThisMonth > 0 ? 100 : 0) : Number(((contractsThisMonth - contractsLastMonth) / contractsLastMonth * 100).toFixed(1));

  // Khách hàng mới
  const contactsThisMonth = contacts.filter(c => c.createdAt && new Date(c.createdAt) >= firstDayThisMonth).length;
  const contactsLastMonth = contacts.filter(c => c.createdAt && new Date(c.createdAt) >= firstDayLastMonth && new Date(c.createdAt) < firstDayThisMonth).length;
  const contactsTrend = contactsLastMonth === 0 ? (contactsThisMonth > 0 ? 100 : 0) : Number(((contactsThisMonth - contactsLastMonth) / contactsLastMonth * 100).toFixed(1));

  // 2. Chart Data: Revenue by Package (Donut)
  const revenueByPkg: Record<string, number> = {};
  for (const d of activeDeals) {
    const pkg = d.customFields?.goi_dich_vu as string ?? 'Khác';
    revenueByPkg[pkg] = (revenueByPkg[pkg] ?? 0) + d.value;
  }
  const PACKAGE_COLORS = ['#f59e0b', '#a8a29e', '#3b82f6', '#6366f1']; // Gold, Silver, Diamond, Others
  const revenueData = Object.entries(revenueByPkg).map(([name, value], i) => ({
    name, value, color: PACKAGE_COLORS[i % PACKAGE_COLORS.length],
  }));

  // 3. Chart Data: Last 6 Months (Revenue & Deals)
  const arrData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`, revenue: 0, deals: 0 };
  });
  for (const deal of deals) {
    if (!deal.createdAt) continue;
    const created = new Date(deal.createdAt as string);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    if (created < sixMonthsAgo) continue;
    const monthIdx = (created.getFullYear() - now.getFullYear()) * 12 + created.getMonth() - (now.getMonth() - 5);
    if (monthIdx >= 0 && monthIdx < arrData.length) {
      if (deal.stage === 'won' || deal.stage === 'active') {
        arrData[monthIdx].revenue += deal.value;
        arrData[monthIdx].deals += 1;
      }
    }
  }

  // 4. Staff Leaderboard
  const staffSalesMap: Record<string, { name: string, value: number }> = {};
  for (const deal of activeDeals) {
    const ownerName = deal.ownerId ? (users.find(u => u.id === deal.ownerId)?.name || 'Nhân viên ẩn') : 'Chưa phân công';
    if (!staffSalesMap[ownerName]) staffSalesMap[ownerName] = { name: ownerName, value: 0 };
    staffSalesMap[ownerName].value += deal.value;
  }
  const staffSales = Object.values(staffSalesMap).sort((a, b) => b.value - a.value).slice(0, 3);
  const maxSales = Math.max(...staffSales.map(s => s.value), 1);

  // 5. Expiring Contracts & Churn List
  const expiringDeals = deals.filter(d => d.stage === 'renewal').slice(0, 5);
  const allLostDeals = deals.filter(d => d.stage === 'lost');
  const churnedDeals = allLostDeals.slice(0, 5);
  const lostDealsCount = allLostDeals.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* HEADER TOOLS (Mocked specific to CEO Dashboard) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
        <button style={{ padding: '6px 12px', borderRadius: 6, background: '#ecfdf5', color: '#10b981', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Download size={14} /> Xuất PDF
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} /> Live
        </div>
      </div>

      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        <IzMetricCard
          label="DOANH THU THÁNG NÀY"
          value={<span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{revenueThisMonth > 1000000 ? `${(revenueThisMonth / 1000000).toFixed(1)} Triệu` : fmt(revenueThisMonth)}</span>}
          trend={revenueTrend}
          description={`Tháng trước: ${revenueLastMonth > 1000000 ? `${(revenueLastMonth / 1000000).toFixed(1)} Triệu` : fmt(revenueLastMonth)}`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#ecfdf5', color: '#10b981', fontSize: 15 }}>💲</span>}
          style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderRadius: 12 }}
        />
        <IzMetricCard
          label="LEAD MỚI THÁNG NÀY"
          value={<span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{leadsThisMonth}</span>}
          trend={leadsTrend}
          description={`Tháng trước: ${leadsLastMonth}`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', fontSize: 15 }}>👥</span>}
          style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderRadius: 12 }}
        />
        <IzMetricCard
          label="HỢP ĐỒNG THÁNG NÀY"
          value={<span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{contractsThisMonth}</span>}
          trend={contractsTrend}
          description={`Ký mới: ${wonThisMonth.length} / Tái ký: ${renewalThisMonth.length}`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#fffbeb', color: '#f59e0b', fontSize: 15 }}>📄</span>}
          style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderRadius: 12 }}
        />
        <IzMetricCard
          label="KHÁCH HÀNG MỚI"
          value={<span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{contactsThisMonth}</span>}
          trend={contactsTrend}
          description={`Tháng trước: ${contactsLastMonth}`}
          icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#f5f3ff', color: '#8b5cf6', fontSize: 15 }}>🏢</span>}
          style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderRadius: 12 }}
        />
      </div>

      {/* FILTER BAR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>HIỂN THỊ:</span>
        <div style={{ display: 'flex', background: '#fff', padding: 4, borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {['3', '6', '12', 'all'].map(t => (
            <button
              key={t}
              onClick={() => setTimeFilter(t as any)}
              style={{
                padding: '6px 16px',
                borderRadius: 16,
                border: 'none',
                background: timeFilter === t ? '#10b981' : 'transparent',
                color: timeFilter === t ? '#fff' : '#64748b',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {t === 'all' ? 'Tất cả' : `${t} Tháng`}
            </button>
          ))}
        </div>
      </div>

      {/* CHARTS ROW (4 Columns natively matching the image) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-5)' }}>
        
        {/* Lượng deal đã chốt (Bar) */}
        <IzCard style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderRadius: 12 }}>
          <IzCardHeader>
            <IzCardTitle style={{ fontSize: 14, fontWeight: 700 }}>Số lượng deal đã chốt</IzCardTitle>
          </IzCardHeader>
          <IzCardContent>
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={arrData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} labelStyle={{ color: '#0f172a' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="deals" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={16}>
                    {arrData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === arrData.length - 1 ? '#3b82f6' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </IzCardContent>
        </IzCard>

        {/* Gói Dịch Vụ (Donut) */}
        <IzCard style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderRadius: 12 }}>
          <IzCardHeader>
            <IzCardTitle style={{ fontSize: 14, fontWeight: 700 }}>Doanh số theo gói dịch vụ</IzCardTitle>
          </IzCardHeader>
          <IzCardContent>
            <div style={{ height: 180, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} stroke="none">
                    {revenueData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(val: number) => fmt(val)} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {mrr > 1000000 ? `${(mrr / 1000000).toFixed(1)} Tr` : fmt(mrr)}
                </div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>TỔNG DOANH SỐ</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              {revenueData.map((pkg, idx) => (
                <div key={pkg.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: pkg.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{pkg.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{((pkg.value / mrr) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </IzCardContent>
        </IzCard>

        {/* Doanh số theo tháng (Line) */}
        <IzCard style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderRadius: 12 }}>
          <IzCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IzCardTitle style={{ fontSize: 14, fontWeight: 700 }}>Doanh số theo tháng</IzCardTitle>
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>● THỰC TẾ</span>
          </IzCardHeader>
          <IzCardContent>
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={arrData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                  <RechartsTooltip formatter={(val: number) => fmt(val)} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </IzCardContent>
        </IzCard>

        {/* Doanh số nhân viên (Leaderboard) */}
        <IzCard style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderRadius: 12, display: 'flex', flexDirection: 'column' }}>
          <IzCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IzCardTitle style={{ fontSize: 14, fontWeight: 700 }}>Doanh số nhân viên</IzCardTitle>
            <span style={{ fontSize: 10, color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 6px' }}>6 tháng</span>
          </IzCardHeader>
          <IzCardContent style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 10 }}>
              {staffSales.map((s, idx) => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e293b', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{s.value > 1000000 ? `${(s.value / 1000000).toFixed(1)} Triệu ₫` : fmt(s.value)}</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: '#f1f5f9', borderRadius: 2 }}>
                    <div style={{ width: `${(s.value / maxSales) * 100}%`, height: '100%', background: idx === 0 ? '#10b981' : '#3b82f6', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </IzCardContent>
          <IzCardFooter style={{ borderTop: '1px solid #f8fafc', padding: '12px 24px', justifyContent: 'center' }}>
            <Link href="/reports" style={{ fontSize: 12, color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
              Xem toàn bộ báo cáo đội ngũ →
            </Link>
          </IzCardFooter>
        </IzCard>
      </div>

      {/* TABLES ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        {/* Hợp đồng sắp hết hạn */}
        <IzCard style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderRadius: 12 }}>
          <IzCardHeader style={{ paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⏰</span>
                <IzCardTitle style={{ fontSize: 15, fontWeight: 700 }}>Hợp đồng sắp hết hạn</IzCardTitle>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{expiringDeals.length}</span>
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>trong 30 ngày tới</span>
            </div>
          </IzCardHeader>
          <IzCardContent style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {expiringDeals.length > 0 ? expiringDeals.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i < expiringDeals.length - 1 ? '1px solid #f8fafc' : 'none', borderLeft: '3px solid #ef4444' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{d.name}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Hết hạn: {formatDate(new Date())}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{i + 1}d</span>
                    <button style={{ padding: '6px 16px', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      ↻ Gia hạn
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Không có hợp đồng nào sắp hết hạn.</div>
              )}
            </div>
          </IzCardContent>
        </IzCard>

        {/* Khách hàng rời bỏ */}
        <IzCard style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderRadius: 12 }}>
          <IzCardHeader style={{ paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <IzCardTitle style={{ fontSize: 15, fontWeight: 700 }}>Khách hàng rời bỏ <span style={{ color: '#94a3b8', fontWeight: 500 }}>(Churn)</span></IzCardTitle>
                <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{lostDealsCount}</span>
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Mới nhất</span>
            </div>
          </IzCardHeader>
          <IzCardContent style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {churnedDeals.length > 0 ? churnedDeals.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: i < churnedDeals.length - 1 ? '1px solid #f8fafc' : 'none', borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{d.name}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Lý do: Không tái ký</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{formatDate(d.createdAt || new Date().toISOString())}</span>
                </div>
              )) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Hiện chưa có khách hàng rời bỏ.</div>
              )}
            </div>
          </IzCardContent>
        </IzCard>
      </div>

    </div>
  );
}
