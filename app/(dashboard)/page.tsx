import { listContacts } from '@/modules/crm/engine/contacts';
import { listDeals } from '@/modules/crm/engine/deals';
import { listServicePackages } from '@/core/engine/service-packages';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

export const metadata = { title: 'Dashboard — izhubs ERP' };

// ── Text labels (bilingual) ───────────────────────────────────
type Locale = 'en' | 'vi';

function getLocaleFromCookies(): Locale {
  // Read from hz_locale cookie set by LanguageProvider
  try {
    const jar = cookies();
    // cookies() is async in Next.js 15 — for Next.js 14 it's sync
    const locale = (jar as unknown as { get(name: string): { value: string } | undefined }).get('hz_locale')?.value;
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
    viewAll: 'View all →',
    viewPipeline: 'View Pipeline →',
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
    viewAll: 'Xem tất cả →',
    viewPipeline: 'Xem Pipeline →',
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

const VO_STAGES = [
  { key: 'lead',        labelEn: 'New Lead',       labelVi: 'Lead mới',        color: '#94a3b8' },
  { key: 'proposal',    labelEn: 'Proposal Sent',  labelVi: 'Đã gửi proposal', color: '#60a5fa' },
  { key: 'negotiation', labelEn: 'Negotiation',    labelVi: 'Đàm phán',        color: '#f59e0b' },
  { key: 'onboarding',  labelEn: 'Onboarding',     labelVi: 'Onboarding',      color: '#a78bfa' },
  { key: 'active',      labelEn: 'Active Client',  labelVi: 'Đang chạy',       color: '#34d399' },
  { key: 'renewal',     labelEn: 'Up for Renewal', labelVi: 'Gia hạn',         color: '#f97316' },
  { key: 'won',         labelEn: 'Won',            labelVi: 'Chốt',            color: '#22c55e' },
  { key: 'lost',        labelEn: 'Lost',           labelVi: 'Không chốt',      color: '#ef4444' },
];

function formatVND(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return v > 0 ? String(v) : '0';
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899'];
function nameColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff;
  return COLORS[h % COLORS.length];
}

// Generate synthetic monthly revenue data from deals (last 6 months)
function buildArrData(deals: Array<{ value: number; created_at?: Date | string | null }>) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      arr: 0,
    };
  });

  for (const deal of deals) {
    if (!deal.created_at) continue;
    const created = new Date(deal.created_at as string);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    if (created < sixMonthsAgo) continue;
    const monthIdx = (created.getFullYear() - now.getFullYear()) * 12 + created.getMonth() - (now.getMonth() - 5);
    if (monthIdx >= 0 && monthIdx < months.length) {
      months[monthIdx].arr += deal.value;
    }
  }
  return months;
}

export default async function DashboardPage() {
  const locale: Locale = getLocaleFromCookies();
  const t = T[locale];
  const isVi = locale === 'vi';

  const [{ data: contacts, meta: contactsMeta }, { data: deals }, packages] = await Promise.all([
    listContacts({ limit: 8 }),
    listDeals({ limit: 500 }),
    listServicePackages('00000000-0000-0000-0000-000000000001').catch(() => []),
  ]);

  // KPIs
  const activeDeals  = deals.filter(d => (d.stage as string) === 'active');
  const renewalDeals = deals.filter(d => (d.stage as string) === 'renewal');
  const openDeals    = deals.filter(d => !['won', 'lost'].includes(d.stage));
  const mrr          = activeDeals.reduce((s, d) => s + d.value, 0);

  const kpis = [
    { labelKey: 'mrr',          value: `${formatVND(mrr)}đ`,          icon: '💰', href: '/contracts',  color: '#6366f1' },
    { labelKey: 'activeClients',value: String(activeDeals.length),     icon: '✅', href: '/contracts',  color: '#10b981' },
    { labelKey: 'renewalsDue',  value: String(renewalDeals.length),    icon: '🔔', href: '/contracts',  color: '#f97316' },
    { labelKey: 'openDeals',    value: String(openDeals.length),       icon: '📊', href: '/deals',      color: '#60a5fa' },
  ];

  // Stage breakdown (Virtual Office stages)
  const stageCounts = VO_STAGES.map(s => ({
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

  // ARR trend data
  const arrData = buildArrData(deals);

  // Recent activity: last 8 contacts
  const recentContacts = contacts.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: 4 }}>{t.title}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t.subtitle}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        {kpis.map(kpi => (
          <Link key={kpi.labelKey} href={kpi.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: kpi.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                {kpi.icon}
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t[kpi.labelKey]}
                </p>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
                  {kpi.value}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row: ARR Line + Revenue Donut */}
      <DashboardCharts arrData={arrData} revenueData={revenueData} locale={locale} />

      {/* Bottom Row: Pipeline Breakdown + Top Customers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>

        {/* Pipeline Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{t.pipelineBreakdown}</h2>
            <Link href="/deals" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>{t.viewPipeline}</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {stageCounts.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ width: 120, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {isVi ? s.labelVi : s.labelEn}
                </span>
                <div style={{ flex: 1, height: 6, background: 'var(--color-bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(s.count / maxCount) * 100}%`, background: s.color, borderRadius: 4, minWidth: s.count > 0 ? 4 : 0 }} />
                </div>
                <span style={{ width: 20, textAlign: 'right', fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Customers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{t.topCustomers}</h2>
            <Link href="/contacts" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>{t.viewAll}</Link>
          </div>
          {topCustomers.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t.noDeals}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {topCustomers.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', width: 16, textAlign: 'center' }}>#{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {(d.customFields as Record<string, unknown>)?.goi_dich_vu as string ?? d.stage}
                    </div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                    {formatVND(d.value)}đ
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Contacts Activity Feed */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{t.recentActivity}</h2>
          <Link href="/contacts" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>{t.viewAll}</Link>
        </div>
        {recentContacts.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t.noContacts}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
            {recentContacts.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: nameColor(c.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {initials(c.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  {c.title && <div style={{ fontSize: 10, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
