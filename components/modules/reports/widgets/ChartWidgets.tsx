// =============================================================
// izhubs ERP — Chart Widgets (CEO Dashboard — Phase 2b)
// Server Components: fetch data → pass to lazy-loaded recharts.
// Charts lazy-loaded (ssr: false) per ui-design-language.md rule.
// =============================================================

import dynamic from 'next/dynamic';
import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';

// ---- Lazy-load chart components (no SSR) --------------------
const ArrTrendChart = dynamic(
  () => import('./charts/ArrTrendChart'),
  { ssr: false, loading: () => <ChartSkeleton height={220} /> }
);
const RevenueByPackageChart = dynamic(
  () => import('./charts/RevenueByPackageChart'),
  { ssr: false, loading: () => <ChartSkeleton height={180} /> }
);
const PipelineFunnelChart = dynamic(
  () => import('./charts/PipelineFunnelChart'),
  { ssr: false, loading: () => <ChartSkeleton height={200} /> }
);

// Minimal skeleton to show while chart JS loads
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div style={{
      height, background: 'var(--color-bg-hover)',
      borderRadius: 'var(--radius-md)',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  );
}

// ---- chart.arr_trend ----------------------------------------
export async function ArrTrendWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       to_char(date_trunc('month', updated_at), 'MM/YYYY') AS month,
       COALESCE(SUM(value), 0)::integer                    AS revenue
     FROM deals
     WHERE tenant_id = $1
       AND stage = 'won'
       AND updated_at >= now() - interval '6 months'
       AND deleted_at IS NULL
     GROUP BY date_trunc('month', updated_at)
     ORDER BY date_trunc('month', updated_at)`,
    [tenantId]
  );

  return (
    <div className="card">
      <div className="card-header">Doanh thu 6 tháng (ARR Trend)</div>
      <div style={{ marginTop: 'var(--space-3)' }}>
        <ArrTrendChart data={result.rows.map((r) => ({
          month: r.month as string,
          revenue: Number(r.revenue),
        }))} />
      </div>
    </div>
  );
}

// ---- chart.revenue_by_package --------------------------------
export async function RevenueByPackageWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       sp.name                                                   AS name,
       COUNT(d.id)::integer                                      AS count,
       COALESCE(SUM(d.value), 0)::integer                        AS revenue
     FROM service_packages sp
     LEFT JOIN deals d ON d.package_id = sp.id
       AND d.stage NOT IN ('won','lost')
       AND d.tenant_id = sp.tenant_id
     WHERE sp.tenant_id = $1
     GROUP BY sp.id, sp.name
     ORDER BY revenue DESC
     LIMIT 8`,
    [tenantId]
  );

  return (
    <div className="card">
      <div className="card-header">Doanh thu theo Gói dịch vụ</div>
      <div style={{ marginTop: 'var(--space-3)' }}>
        <RevenueByPackageChart data={result.rows.map((r) => ({
          name: r.name as string,
          count: Number(r.count),
          revenue: Number(r.revenue),
        }))} />
      </div>
    </div>
  );
}

// ---- chart.pipeline_funnel ----------------------------------
export async function PipelineFunnelWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       stage,
       COUNT(*)::integer          AS count,
       COALESCE(SUM(value), 0)    AS value
     FROM deals
     WHERE tenant_id = $1
       AND stage NOT IN ('won', 'lost')
       AND deleted_at IS NULL
     GROUP BY stage
     ORDER BY count DESC`,
    [tenantId]
  );

  const STAGE_LABELS: Record<string, string> = {
    lead: 'Lead', proposal: 'Proposal', negotiation: 'Đàm phán',
    onboarding: 'Onboarding', active: 'Active', renewal: 'Gia hạn',
  };

  return (
    <div className="card">
      <div className="card-header">Pipeline theo Stage</div>
      <div style={{ marginTop: 'var(--space-3)' }}>
        <PipelineFunnelChart data={result.rows.map((r) => ({
          stage: STAGE_LABELS[r.stage as string] ?? r.stage as string,
          count: Number(r.count),
          value: Number(r.value),
        }))} />
      </div>
    </div>
  );
}
