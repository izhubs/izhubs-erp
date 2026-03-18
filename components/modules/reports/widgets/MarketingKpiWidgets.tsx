// =============================================================
// izhubs ERP — Marketing KPI Widgets
// Server Components for Marketing/CMO Dashboard.
// =============================================================

import KpiCard from '@/components/shared/KpiCard';
import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth';

// ---- kpi.leads_month ----------------------------------------
export async function LeadsMonthWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       COUNT(*) AS this_month,
       COUNT(*) FILTER (
         WHERE date_trunc('month', created_at) = date_trunc('month', now()) - interval '1 month'
       ) AS last_month
     FROM contacts
     WHERE tenant_id = $1
       AND type = 'lead'
       AND date_trunc('month', created_at) >= date_trunc('month', now()) - interval '1 month'`,
    [tenantId]
  );
  const { this_month = 0, last_month = 1 } = result.rows[0] ?? {};
  const pct = last_month > 0
    ? (((Number(this_month) - Number(last_month)) / Number(last_month)) * 100).toFixed(0)
    : null;

  return (
    <KpiCard
      label="Tổng leads tháng này"
      value={String(this_month)}
      trend={pct ? `${Number(pct) > 0 ? '+' : ''}${pct}%` : undefined}
      trendDirection={Number(pct) >= 0 ? 'up' : 'down'}
    />
  );
}

// ---- kpi.conversion_rate ------------------------------------
export async function ConversionRateWidget() {
  const tenantId = await getTenantId();
  const result = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE type = 'lead') AS leads,
       COUNT(*) FILTER (WHERE stage = 'won') AS won
     FROM deals
     WHERE tenant_id = $1
       AND date_trunc('month', created_at) = date_trunc('month', now())`,
    [tenantId]
  );
  const { leads = 1, won = 0 } = result.rows[0] ?? {};
  const rate = ((Number(won) / Math.max(Number(leads), 1)) * 100).toFixed(1);

  return (
    <KpiCard
      label="Tỷ lệ chuyển đổi lead → khách"
      value={`${rate}%`}
      subLabel="Lead đã tạo thành deal tháng này"
      trendDirection="neutral"
    />
  );
}

// ---- kpi.cac ------------------------------------------------
export async function CacWidget() {
  const tenantId = await getTenantId();
  // CAC = Marketing spend / new customers acquired this month
  // Marketing spend stored in future campaigns table; show placeholder
  const result = await db.query(
    `SELECT COUNT(*) AS new_customers
     FROM deals
     WHERE tenant_id = $1
       AND stage = 'won'
       AND date_trunc('month', close_date) = date_trunc('month', now())`,
    [tenantId]
  );
  const { new_customers = 1 } = result.rows[0] ?? {};
  // TODO: integrate with campaigns.budget when campaigns module is ready
  const marketingSpend = 23_000_000; // placeholder
  const cac = Math.round(marketingSpend / Math.max(Number(new_customers), 1));

  return (
    <KpiCard
      label="Chi phí mỗi khách (CAC)"
      value={`${cac.toLocaleString('vi-VN')}đ`}
      subLabel={`${new_customers} khách mới tháng này`}
      trendDirection="neutral"
    />
  );
}
