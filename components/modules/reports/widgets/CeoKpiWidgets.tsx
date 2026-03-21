// =============================================================
// izhubs ERP — KPI Widgets (CEO Dashboard)
// Server Components — each fetches its own data via engine functions.
// Placed in WIDGET_MAP under widgetId keys from navConfig.
// =============================================================

import KpiCard from '@/components/shared/KpiCard';
import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';
import { Money } from '@/components/shared/Money';

// ---- kpi.mrr ------------------------------------------------
export async function MrrWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       COALESCE(SUM(d.value), 0) AS mrr,
       COALESCE(SUM(prev.value), 0) AS prev_mrr
     FROM deals d
     LEFT JOIN deals prev ON prev.tenant_id = d.tenant_id
       AND prev.stage = 'active'
       AND date_trunc('month', prev.close_date) = date_trunc('month', now()) - interval '1 month'
     WHERE d.tenant_id = $1 AND d.stage = 'active'`,
    [tenantId]
  );
  const { mrr = 0, prev_mrr = 0 } = result.rows[0] ?? {};
  const trend = prev_mrr > 0 ? (((mrr - prev_mrr) / prev_mrr) * 100).toFixed(1) : null;

  return (
    <KpiCard
      label="MRR (Doanh thu tháng)"
      value={<Money value={mrr} />}
      subLabel={prev_mrr ? <>So với <Money value={prev_mrr} /> tháng trước</> : undefined}
      trend={trend ? `${trend}%` : undefined}
      trendDirection={Number(trend) >= 0 ? 'up' : 'down'}
    />
  );
}

// ---- kpi.customers ------------------------------------------
export async function CustomersWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE d.stage = 'active') AS total,
       COUNT(*) FILTER (
         WHERE d.stage = 'active'
         AND date_trunc('month', d.created_at) = date_trunc('month', now())
       ) AS new_this_month
     FROM deals d WHERE d.tenant_id = $1`,
    [tenantId]
  );
  const { total = 0, new_this_month = 0 } = result.rows[0] ?? {};

  return (
    <KpiCard
      label="Khách hàng đang dùng dịch vụ"
      value={`${total} khách`}
      subLabel="Đang hoạt động trên hệ thống"
      trend={`+${new_this_month} tháng này`}
      trendDirection="up"
    />
  );
}

// ---- kpi.churn ----------------------------------------------
export async function ChurnWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE d.stage = 'lost'
         AND date_trunc('month', d.updated_at) = date_trunc('month', now())
       ) AS churned,
       COUNT(*) FILTER (WHERE d.stage = 'active'
         AND date_trunc('month', d.created_at) <= date_trunc('month', now()) - interval '1 month'
       ) AS base
     FROM deals d WHERE d.tenant_id = $1`,
    [tenantId]
  );
  const { churned = 0, base = 1 } = result.rows[0] ?? {};
  const rate = ((Number(churned) / Math.max(Number(base), 1)) * 100).toFixed(1);
  const isUrgent = Number(rate) >= 5;

  return (
    <KpiCard
      label="Tỷ lệ rời bỏ (Churn)"
      value={`${rate}%`}
      subLabel="Ngưỡng an toàn (< 5%)"
      trendDirection={isUrgent ? 'down' : 'neutral'}
      urgent={isUrgent}
    />
  );
}

// ---- kpi.contracts_expiring ---------------------------------
export async function ContractsExpiringWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT COUNT(*) AS expiring
     FROM deals d
     WHERE d.tenant_id = $1
       AND d.stage = 'renewal'
       AND d.close_date BETWEEN now() AND now() + interval '30 days'`,
    [tenantId]
  );
  const { expiring = 0 } = result.rows[0] ?? {};
  const isUrgent = Number(expiring) > 0;

  return (
    <KpiCard
      label="Hợp đồng sắp hết hạn (30 ngày)"
      value={`${expiring} hợp đồng`}
      subLabel="Cần xử lý gia hạn ngay"
      urgent={isUrgent}
      trendDirection={isUrgent ? 'down' : 'neutral'}
    />
  );
}
