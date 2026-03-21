import { listContacts } from '@/modules/crm/engine/contacts';
import { listDeals } from '@/modules/crm/engine/deals';
import { listServicePackages } from '@/core/engine/service-packages';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { db } from '@/core/engine/db';
import { IzMetricCard } from '@/components/ui/IzMetricCard';
import { IzCard, IzCardHeader, IzCardTitle, IzCardContent } from '@/components/ui/IzCard';
import { formatMoney } from '@/lib/userTime';
import { getEffectiveRole } from '@/core/engine/auth/server-context';

export const metadata = { title: 'Dashboard — izhubs ERP' };
export const dynamic = 'force-dynamic';

// ── Text labels (bilingual) ───────────────────────────────────
type Locale = 'en' | 'vi';

async function getLocaleFromCookies(): Promise<Locale> {
  try {
    const jar = await cookies();
    const locale = jar.get('hz_locale')?.value;
    return locale === 'vi' ? 'vi' : 'en';
  } catch {
    return 'en';
  }
}

const T: Record<Locale, Record<string, string>> = {
  en: {
    title: 'Dashboard',
    subtitle: 'Your Virtual Office business at a glance',
    mrr: 'Monthly Revenue',
    activeClients: 'Active Clients',
    renewalsDue: 'Renewals Due',
    openDeals: 'Open Deals',
    topCustomers: 'Top Customers',
    viewAll: 'View all',
    viewPipeline: 'View Pipeline',
    noDeals: 'No deals yet.',
    noContacts: 'No contacts yet.',
    pipelineBreakdown: 'Pipeline Breakdown',
    recentActivity: 'Recent Activity',
    package: 'Package',
    value: 'Value',
    noActivity: 'No recent activity.',
  },
  vi: {
    title: 'Tổng quan',
    subtitle: 'Toàn cảnh kinh doanh Virtual Office của bạn',
    mrr: 'Doanh thu tháng',
    activeClients: 'Khách đang hoạt động',
    renewalsDue: 'Cần gia hạn',
    openDeals: 'Deal đang mở',
    topCustomers: 'Khách hàng lớn nhất',
    viewAll: 'Xem tất cả',
    viewPipeline: 'Xem Pipeline',
    noDeals: 'Chưa có deal nào.',
    noContacts: 'Chưa có liên hệ.',
    pipelineBreakdown: 'Phân bổ Pipeline',
    recentActivity: 'Hoạt động gần đây',
    package: 'Gói dịch vụ',
    value: 'Giá trị',
    noActivity: 'Chưa có hoạt động gần đây.',
  },
};

const PACKAGE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f97316', '#0ea5e9'];

const DEFAULT_STAGES = [
  { key: 'lead',        label: 'New Lead',       color: '#94a3b8' },
  { key: 'proposal',    label: 'Proposal Sent',  color: '#60a5fa' },
  { key: 'negotiation', label: 'Negotiation',    color: '#f59e0b' },
  { key: 'onboarding',  label: 'Onboarding',     color: '#a78bfa' },
  { key: 'active',      label: 'Active Client',  color: '#34d399' },
  { key: 'renewal',     label: 'Up for Renewal', color: '#f97316' },
  { key: 'won',         label: 'Won',            color: '#22c55e' },
  { key: 'lost',        label: 'Lost',           color: '#ef4444' },
];

// Compact abbreviation for chart axis only (not for display amounts)
function abbrevMoney(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return v > 0 ? String(v) : '0';
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899'];
function nameColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function buildArrData(deals: Array<{ value: number; created_at?: Date | string | null }>) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: d.toLocaleDateString('en-US', { month: 'short' }), arr: 0 };
  });
  for (const deal of deals) {
    if (!deal.created_at) continue;
    const created = new Date(deal.created_at as string);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    if (created < sixMonthsAgo) continue;
    const monthIdx = (created.getFullYear() - now.getFullYear()) * 12 + created.getMonth() - (now.getMonth() - 5);
    if (monthIdx >= 0 && monthIdx < months.length) months[monthIdx].arr += deal.value;
  }
  return months;
}

export default async function DashboardPage() {
  const locale: Locale = await getLocaleFromCookies();
  const effectiveRole = await getEffectiveRole();
  // Role access levels:
  // superadmin / admin → full dashboard
  // manager → KPIs + charts only
  // member → own pipeline only (no aggregate KPIs)
  // viewer → read-only summary only
  const showFullDashboard = effectiveRole === 'superadmin' || effectiveRole === 'admin';
  const showCharts = showFullDashboard || effectiveRole === 'manager';
  const showPipelineDetails = showFullDashboard || effectiveRole === 'manager';
  const showTopCustomers = showFullDashboard;
  const t = T[locale];

  // Read tenant's template stages from DB
  let templateStages = DEFAULT_STAGES;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hz_access')?.value;
    if (token) {
      const claims = await verifyJwt(token);
      const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
      const res = await db.query(
        `SELECT it.nav_config FROM tenants t
         JOIN industry_templates it ON it.id = t.industry
         WHERE t.id = $1 AND t.active = true`,
        [tenantId]
      );
      const ps = res.rows[0]?.nav_config?.pipelineStages;
      if (Array.isArray(ps) && ps.length > 0) {
        templateStages = ps.map((s: { key: string; label: string; color?: string }) => ({
          key: s.key, label: s.label, color: s.color ?? '#94a3b8',
        }));
      }
    }
  } catch { /* fallback to DEFAULT_STAGES */ }

  const [{ data: contacts }, { data: deals }] = await Promise.all([
    listContacts({ limit: 8 }),
    listDeals({ limit: 500 }),
  ]);
  listServicePackages('00000000-0000-0000-0000-000000000001').catch(() => []);

  // KPIs
  const activeDeals  = deals.filter(d => (d.stage as string) === 'active');
  const renewalDeals = deals.filter(d => (d.stage as string) === 'renewal');
  const openDeals    = deals.filter(d => !['won', 'lost'].includes(d.stage));
  const mrr          = activeDeals.reduce((s, d) => s + d.value, 0);

  const kpis = [
    { labelKey: 'mrr',           value: formatMoney(mrr),              icon: '💰', href: '/contracts', color: '#6366f1' },
    { labelKey: 'activeClients', value: String(activeDeals.length),   icon: '✅', href: '/contracts', color: '#10b981' },
    { labelKey: 'renewalsDue',   value: String(renewalDeals.length),  icon: '🔔', href: '/deals',     color: '#f97316' },
    { labelKey: 'openDeals',     value: String(openDeals.length),     icon: '📊', href: '/deals',     color: '#60a5fa' },
  ];

  // Stage breakdown from template
  const stageCounts = templateStages.map(s => ({
    ...s,
    count: deals.filter(d => d.stage === s.key).length,
    value: deals.filter(d => d.stage === s.key).reduce((sum, d) => sum + d.value, 0),
  }));
  const maxCount = Math.max(...stageCounts.map(s => s.count), 1);

  // Top 5 customers by deal value
  const topCustomers = [...deals]
    .filter(d => !['lost'].includes(d.stage))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Revenue donut: group by custom_fields.goi_dich_vu
  const revenueByPkg: Record<string, number> = {};
  for (const d of activeDeals) {
    const pkg = (d.customFields as Record<string, unknown>)?.goi_dich_vu as string ?? 'Other';
    revenueByPkg[pkg] = (revenueByPkg[pkg] ?? 0) + d.value;
  }
  const revenueData = Object.entries(revenueByPkg).map(([name, value], i) => ({
    name, value, color: PACKAGE_COLORS[i % PACKAGE_COLORS.length],
  }));

  const arrData = buildArrData(deals);
  const recentContacts = contacts.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(1.5rem, 2vw, 2rem)', letterSpacing: '-0.02em' }}>
            {t.title}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 8px var(--color-primary)' }} />
            {t.subtitle}
          </p>
        </div>
        <Link href="/deals" style={{
          fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)',
          textDecoration: 'none', padding: '6px 14px',
          background: 'rgba(99,102,241,0.1)', borderRadius: '100px',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          {t.viewPipeline} →
        </Link>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        {kpis.map(kpi => (
          <Link key={kpi.labelKey} href={kpi.href} style={{ textDecoration: 'none' }}>
            <IzMetricCard
              label={t[kpi.labelKey]}
              value={kpi.value}
              icon={<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: `linear-gradient(135deg, ${kpi.color}15 0%, ${kpi.color}05 100%)`, color: kpi.color, fontSize: 18 }}>{kpi.icon}</span>}
              style={{ height: '100%', borderTop: `3px solid ${kpi.color}` }}
            />
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <DashboardCharts arrData={arrData} revenueData={revenueData} />

      {/* Bottom Row: Pipeline Breakdown + Top Customers — 3:2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 'var(--space-5)' }}>

        {/* Pipeline Breakdown */}
        <IzCard>
          <IzCardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-4)' }}>
            <div>
              <IzCardTitle style={{ margin: '0 0 2px', fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                {t.pipelineBreakdown}
              </IzCardTitle>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{deals.length} total deals</div>
            </div>
            <Link href="/deals" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              {t.viewPipeline} →
            </Link>
          </IzCardHeader>
          <IzCardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stageCounts.map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '3px', background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}66` }} />
                  <span style={{ width: 130, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{s.label}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--color-bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(s.count / maxCount) * 100}%`,
                      background: `linear-gradient(90deg, ${s.color} 0%, ${s.color}99 100%)`,
                      borderRadius: 4, minWidth: s.count > 0 ? 6 : 0,
                    }} />
                  </div>
                  <span style={{ width: 22, textAlign: 'right', fontSize: 'var(--font-size-xs)', fontWeight: 800, color: s.count > 0 ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {s.count}
                  </span>
                  {s.value > 0 && (
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', minWidth: 52, textAlign: 'right' }}>
                      {abbrevMoney(s.value)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </IzCardContent>
        </IzCard>

        {/* Top 5 Customers */}
        <IzCard style={{ display: 'flex', flexDirection: 'column' }}>
          <IzCardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-4)' }}>
            <IzCardTitle style={{ margin: 0, fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
              {t.topCustomers}
            </IzCardTitle>
            <Link href="/contacts" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              {t.viewAll} →
            </Link>
          </IzCardHeader>
          <IzCardContent style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {topCustomers.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t.noDeals}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {topCustomers.map((d, i) => (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: i === 0 ? 'linear-gradient(90deg, rgba(99,102,241,0.05) 0%, transparent 100%)' : 'transparent',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: i === 0 ? 'var(--color-primary)' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : 'var(--color-bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: i < 3 ? '#fff' : 'var(--color-text-muted)', flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                        {(d.customFields as Record<string, unknown>)?.goi_dich_vu as string ?? d.stage}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0, background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                      {formatMoney(d.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </IzCardContent>
        </IzCard>
      </div>

      {/* Recent Activity */}
      <IzCard>
        <IzCardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-4)' }}>
          <IzCardTitle style={{ margin: 0, fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
            {t.recentActivity}
          </IzCardTitle>
          <Link href="/contacts" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            {t.viewAll} →
          </Link>
        </IzCardHeader>
        <IzCardContent>
          {recentContacts.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t.noContacts}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
              {recentContacts.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${nameColor(c.name)} 0%, ${nameColor(c.name)}dd 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {initials(c.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    {c.title && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </IzCardContent>
      </IzCard>
    </div>
  );
}
