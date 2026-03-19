import { listContacts } from '@/modules/crm/engine/contacts';
import { listDeals } from '@/modules/crm/engine/deals';
import { listServicePackages } from '@/core/engine/service-packages';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { db } from '@/core/engine/db';

export const metadata = { title: 'Dashboard — izhubs ERP' };
export const dynamic = 'force-dynamic';

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

// Stage breakdown — read from template or fall back to VO defaults
const DEFAULT_STAGES = [
  { key: 'lead',        label: 'New Lead',       labelVi: 'Lead mới',        color: '#94a3b8' },
  { key: 'proposal',    label: 'Proposal Sent',  labelVi: 'Đã gửi proposal', color: '#60a5fa' },
  { key: 'negotiation', label: 'Negotiation',    labelVi: 'Đàm phán',        color: '#f59e0b' },
  { key: 'onboarding',  label: 'Onboarding',     labelVi: 'Onboarding',      color: '#a78bfa' },
  { key: 'active',      label: 'Active Client',  labelVi: 'Đang chạy',       color: '#34d399' },
  { key: 'renewal',     label: 'Up for Renewal', labelVi: 'Gia hạn',         color: '#f97316' },
  { key: 'won',         label: 'Won',            labelVi: 'Chốt',            color: '#22c55e' },
  { key: 'lost',        label: 'Lost',           labelVi: 'Không chốt',      color: '#ef4444' },
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
          key: s.key, label: s.label, labelVi: s.label, color: s.color ?? '#94a3b8',
        }));
      }
    }
  } catch { /* fallback to DEFAULT_STAGES */ }

  const [{ data: contacts }, { data: deals }, packages] = await Promise.all([
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

  // ARR trend data
  const arrData = buildArrData(deals);

  // Recent activity: last 8 contacts
  const recentContacts = contacts.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header — gradient subtitle accent */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(1.5rem, 2vw, 2rem)', letterSpacing: '-0.02em' }}>
            {t.title}
          </h1>
          <p style={{
            margin: '4px 0 0',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
              background: 'var(--color-primary)',
              boxShadow: '0 0 8px var(--color-primary)',
              animation: 'pulseKpi 2.4s ease-in-out infinite',
            }} />
            {t.subtitle}
          </p>
        </div>
        <Link href="/deals" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 'var(--font-size-sm)', fontWeight: 600,
          color: 'var(--color-primary)', textDecoration: 'none',
          padding: '6px 14px',
          background: 'var(--color-primary-light, rgba(99,102,241,0.12))',
          borderRadius: 'var(--radius-full, 100px)',
          border: '1px solid rgba(99,102,241,0.2)',
          transition: 'all 0.2s',
        }}>
          {t.viewPipeline} →
        </Link>
      </div>

      {/* KPI Cards — colored accent border + icon glow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        {kpis.map(kpi => (
          <Link key={kpi.labelKey} href={kpi.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderLeft: `3px solid ${kpi.color}`,
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${kpi.color}22`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '';
            }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: `linear-gradient(135deg, ${kpi.color}30 0%, ${kpi.color}15 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 22,
                boxShadow: `0 0 0 1px ${kpi.color}30`,
              }}>
                {kpi.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  margin: '0 0 2px',
                  fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em',
                  whiteSpace: 'nowrap',
                }}>
                  {t[kpi.labelKey]}
                </p>
                <div style={{
                  fontSize: '1.5rem', fontWeight: 800,
                  color: 'var(--color-text)', letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}>
                  {kpi.value}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <DashboardCharts arrData={arrData} revenueData={revenueData} locale={locale} />

      {/* Bottom Row: Pipeline + Customers — 3:2 ratio */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 'var(--space-5)' }}>

        {/* Pipeline Breakdown — enhanced bar chart */}
        <div style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div>
              <h2 style={{ margin: '0 0 2px', fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
                {t.pipelineBreakdown}
              </h2>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {deals.length} total deals
              </div>
            </div>
            <Link href="/deals" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              {t.viewPipeline} →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {stageCounts.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '3px',
                  background: s.color, flexShrink: 0,
                  boxShadow: `0 0 6px ${s.color}66`,
                }} />
                <span style={{ width: 128, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
                <div style={{ flex: 1, height: 8, background: 'var(--color-bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(s.count / maxCount) * 100}%`,
                    background: `linear-gradient(90deg, ${s.color} 0%, ${s.color}99 100%)`,
                    borderRadius: 4,
                    minWidth: s.count > 0 ? 6 : 0,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 22, textAlign: 'right', fontSize: 'var(--font-size-xs)', fontWeight: 800, color: s.count > 0 ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {s.count}
                  </span>
                  {s.value > 0 && (
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {formatVND(s.value)}đ
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Customers — ranked list with rank badge */}
        <div style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
              {t.topCustomers}
            </h2>
            <Link href="/contacts" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
              {t.viewAll} →
            </Link>
          </div>
          {topCustomers.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t.noDeals}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
              {topCustomers.map((d, i) => (
                <div key={d.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  background: i === 0 ? 'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, transparent 100%)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: i === 0 ? 'var(--color-primary)' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : 'var(--color-bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: i < 3 ? '#fff' : 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                      {(d.customFields as Record<string, unknown>)?.goi_dich_vu as string ?? d.stage}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 'var(--font-size-xs)', fontWeight: 800,
                    color: 'var(--color-primary)', flexShrink: 0,
                    background: 'rgba(99,102,241,0.1)', padding: '2px 6px',
                    borderRadius: 4,
                  }}>
                    {formatVND(d.value)}đ
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity — horizontal scrolling avatars + compact list */}
      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
            {t.recentActivity}
          </h2>
          <Link href="/contacts" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            {t.viewAll} →
          </Link>
        </div>
        {recentContacts.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{t.noContacts}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
            {recentContacts.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(99,102,241,0.2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${nameColor(c.name)} 0%, ${nameColor(c.name)}bb 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
                  boxShadow: `0 2px 8px ${nameColor(c.name)}44`,
                }}>
                  {initials(c.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </div>
                  {c.title && (
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
                  {s.label}
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
