import { listContacts } from '@/core/engine/contacts';
import { listDeals } from '@/core/engine/deals';
import Link from 'next/link';

export const metadata = { title: 'Dashboard — izhubs ERP' };

export default async function DashboardPage() {
  // Fetch all data server-side via engine (no HTTP roundtrip)
  const [{ data: contacts, meta: contactsMeta }, { data: deals }] = await Promise.all([
    listContacts({ limit: 5 }),
    listDeals({ limit: 200 }),
  ]);

  // Compute KPIs
  const totalContacts = contactsMeta.total;
  const openDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
  const wonDeals = deals.filter(d => d.stage === 'won');
  const lostDeals = deals.filter(d => d.stage === 'lost');
  const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0);
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);

  const kpis = [
    { label: 'Total Contacts', value: totalContacts.toLocaleString(), icon: '👥', href: '/contacts', delta: null },
    { label: 'Open Deals', value: openDeals.length.toLocaleString(), icon: '📊', href: '/deals', delta: null },
    { label: 'Pipeline Value', value: formatCurrency(pipelineValue), icon: '💰', href: '/deals', delta: null },
    { label: 'Won Value', value: formatCurrency(wonValue), icon: '🏆', href: '/deals', delta: null },
  ];

  // Deal stage breakdown
  const stages = [
    { id: 'new', label: 'New', color: '#94a3b8' },
    { id: 'contacted', label: 'Contacted', color: '#6366f1' },
    { id: 'qualified', label: 'Qualified', color: '#0ea5e9' },
    { id: 'proposal', label: 'Proposal', color: '#f59e0b' },
    { id: 'negotiation', label: 'Negotiation', color: '#f97316' },
    { id: 'won', label: 'Won', color: '#10b981' },
    { id: 'lost', label: 'Lost', color: '#ef4444' },
  ];

  const stageBreakdown = stages.map(s => ({
    ...s,
    count: deals.filter(d => d.stage === s.id).length,
    value: deals.filter(d => d.stage === s.id).reduce((sum, d) => sum + d.value, 0),
  }));

  const maxCount = Math.max(...stageBreakdown.map(s => s.count), 1);

  // Recent contacts (last 5)
  const recentContacts = contacts.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
          Your business at a glance
        </p>
      </div>

      {/* KPI cards */}
      <div className="card-grid">
        {kpis.map(kpi => (
          <Link key={kpi.label} href={kpi.href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p className="text-muted text-sm" style={{ margin: '0 0 var(--space-2)' }}>{kpi.label}</p>
                  <div style={{ fontSize: 'var(--font-size-2xl, 1.75rem)', fontWeight: 700, color: 'var(--color-text)' }}>
                    {kpi.value}
                  </div>
                </div>
                <span style={{ fontSize: 28 }}>{kpi.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pipeline funnel */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Pipeline Breakdown</h2>
          <Link href="/deals" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
            View Kanban →
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {stageBreakdown.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: s.color, flexShrink: 0
              }} />
              <span style={{ width: 100, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                {s.label}
              </span>
              <div style={{ flex: 1, height: 8, background: 'var(--color-bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(s.count / maxCount) * 100}%`,
                  background: s.color,
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                  minWidth: s.count > 0 ? 4 : 0,
                }} />
              </div>
              <span style={{ width: 24, textAlign: 'right', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                {s.count}
              </span>
              {s.value > 0 && (
                <span style={{ width: 64, textAlign: 'right', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {formatCurrency(s.value)}
                </span>
              )}
            </div>
          ))}
        </div>
        {deals.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', fontSize: 'var(--font-size-sm)', padding: 'var(--space-4) 0 0' }}>
            No deals yet. <Link href="/deals">Add your first deal →</Link>
          </p>
        )}
      </div>

      {/* Recent contacts */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>Recent Contacts</h2>
          <Link href="/contacts" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
            View all →
          </Link>
        </div>
        {recentContacts.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
            No contacts yet. <Link href="/contacts">Add your first contact →</Link>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {recentContacts.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: nameColor(c.name),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {initials(c.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{c.name}</div>
                  {(c.email || c.title) && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {c.title ?? c.email}
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

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return v > 0 ? `$${v.toLocaleString()}` : '$0';
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
