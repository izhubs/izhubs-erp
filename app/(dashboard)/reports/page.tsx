// =============================================================
// izhubs ERP — /reports page (Analytics Hub — Virtual Office)
// Tổng hợp số liệu kinh doanh cho CEO, CMO, Sales Manager.
// Server Component — tất cả queries chạy server-side.
// =============================================================

import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';
import { PageHeader, KpiCard, Badge } from '@/components/shared';

export const metadata = { title: 'Báo cáo & Phân tích — izhubs ERP' };

export default async function ReportsPage() {
  const tenantId = await getTenantId();

  const [kpisRes, stagesRes, topDealsRes, monthlyRes] = await Promise.all([
    // Overall KPIs
    db.query(
      `SELECT
         COUNT(*) FILTER (WHERE stage = 'won'
           AND date_trunc('month', updated_at) = date_trunc('month', now())) AS won_this_month,
         COUNT(*) FILTER (WHERE stage = 'lost'
           AND date_trunc('month', updated_at) = date_trunc('month', now())) AS lost_this_month,
         COALESCE(SUM(value) FILTER (WHERE stage = 'won'
           AND date_trunc('month', updated_at) = date_trunc('month', now())), 0) AS revenue_this_month,
         COALESCE(SUM(value) FILTER (WHERE stage = 'active'), 0) AS arr,
         COUNT(*) FILTER (WHERE stage NOT IN ('won','lost') AND deleted_at IS NULL) AS open_deals,
         COUNT(*) FILTER (WHERE stage = 'won') AS total_won
       FROM deals WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId]
    ),
    // Deals by stage
    db.query(
      `SELECT stage, COUNT(*) AS count, COALESCE(SUM(value), 0) AS total_value
       FROM deals
       WHERE tenant_id = $1 AND deleted_at IS NULL AND stage NOT IN ('won', 'lost')
       GROUP BY stage
       ORDER BY count DESC`,
      [tenantId]
    ),
    // Top deals (won this month)
    db.query(
      `SELECT d.name, d.value, d.stage, c.name AS company, u.name AS owner
       FROM deals d
       LEFT JOIN contacts c ON c.id = d.company_id
       LEFT JOIN users u ON u.id = d.owner_id
       WHERE d.tenant_id = $1
         AND d.stage = 'won'
         AND date_trunc('month', d.updated_at) = date_trunc('month', now())
         AND d.deleted_at IS NULL
       ORDER BY d.value DESC
       LIMIT 8`,
      [tenantId]
    ),
    // Last 6 months revenue
    db.query(
      `SELECT
         to_char(date_trunc('month', updated_at), 'MM/YYYY') AS month,
         COALESCE(SUM(value), 0) AS revenue
       FROM deals
       WHERE tenant_id = $1
         AND stage = 'won'
         AND updated_at >= now() - interval '6 months'
         AND deleted_at IS NULL
       GROUP BY date_trunc('month', updated_at)
       ORDER BY date_trunc('month', updated_at)`,
      [tenantId]
    ),
  ]);

  const kpis = kpisRes.rows[0];
  const stages = stagesRes.rows;
  const topDeals = topDealsRes.rows;
  const monthly = monthlyRes.rows;

  const totalDealsForWinRate = Number(kpis.won_this_month) + Number(kpis.lost_this_month);
  const winRate = totalDealsForWinRate > 0
    ? ((Number(kpis.won_this_month) / totalDealsForWinRate) * 100).toFixed(0)
    : '—';

  const STAGE_LABELS: Record<string, string> = {
    lead: 'Lead mới', proposal: 'Gửi Proposal', negotiation: 'Đàm phán',
    onboarding: 'Onboarding', active: 'Đang chạy', renewal: 'Gia hạn',
  };

  return (
    <div className="page">
      <PageHeader
        title="Báo cáo & Phân tích"
        subtitle="Tổng quan kinh doanh — Virtual Office"
        actions={
          <button className="btn btn-ghost">📥 Xuất CSV</button>
        }
      />

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <KpiCard
          label="Doanh thu tháng này"
          value={`${Number(kpis.revenue_this_month).toLocaleString('vi-VN')}đ`}
          trendDirection="up"
        />
        <KpiCard label="Deals chốt tháng này" value={String(kpis.won_this_month)} trendDirection="up" />
        <KpiCard label="Deals thất bại" value={String(kpis.lost_this_month)} trendDirection="down" />
        <KpiCard label="Win Rate tháng này" value={`${winRate}%`} trendDirection="neutral" />
        <KpiCard label="Deals đang mở" value={String(kpis.open_deals)} trendDirection="neutral" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
        {/* Pipeline stage breakdown */}
        <div className="card">
          <div className="card-header">Pipeline theo Stage</div>
          {stages.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)' }}>
              Chưa có deals nào.
            </p>
          ) : (
            <table className="table" style={{ marginTop: 'var(--space-3)' }}>
              <thead>
                <tr><th>Stage</th><th>Số deals</th><th>Tổng giá trị</th></tr>
              </thead>
              <tbody>
                {stages.map((s) => (
                  <tr key={s.stage}>
                    <td><Badge variant="info">{STAGE_LABELS[s.stage] ?? s.stage}</Badge></td>
                    <td style={{ fontWeight: 600 }}>{s.count}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {Number(s.total_value).toLocaleString('vi-VN')}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Revenue trend (text-based) */}
        <div className="card">
          <div className="card-header">Doanh thu 6 tháng gần nhất</div>
          {monthly.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)' }}>
              Chưa có dữ liệu.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              {monthly.map((m) => {
                const maxRevenue = Math.max(...monthly.map((x) => Number(x.revenue)));
                const pct = maxRevenue > 0 ? (Number(m.revenue) / maxRevenue) * 100 : 0;
                return (
                  <div key={m.month}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: 4 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{m.month}</span>
                      <span style={{ fontWeight: 600 }}>{Number(m.revenue).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div style={{ background: 'var(--color-bg-hover)', borderRadius: 'var(--radius-full)', height: 6 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: 'var(--color-primary)', borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top deals table */}
      <div className="card">
        <div className="card-header">Deals chốt tháng này</div>
        {topDeals.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-3)' }}>
            Chưa có deal nào được chốt tháng này.
          </p>
        ) : (
          <table className="table" style={{ marginTop: 'var(--space-3)' }}>
            <thead>
              <tr><th>Tên deal</th><th>Công ty</th><th>Giá trị</th><th>Phụ trách</th></tr>
            </thead>
            <tbody>
              {topDeals.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{d.name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{d.company ?? '—'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                    {Number(d.value).toLocaleString('vi-VN')}đ
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{d.owner ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
