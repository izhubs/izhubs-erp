// =============================================================
// izhubs ERP — Sales KPI Widgets
// Server Components for Sales Dashboard.
// Personal pipeline data filtered to current user.
// =============================================================

import KpiCard from '@/components/shared/KpiCard';
import { db } from '@/core/engine/db';
import { getTenantId, getCurrentUserId } from '@/core/engine/auth';

// ---- kpi.my_pipeline ----------------------------------------
export async function MyPipelineWidget() {
  const [tenantId, userId] = await Promise.all([getTenantId(), getCurrentUserId()]);
  const result = await db.query(
    `SELECT
       COUNT(*) AS total_deals,
       COALESCE(SUM(value), 0) AS total_value
     FROM deals
     WHERE tenant_id = $1
       AND owner_id = $2
       AND stage NOT IN ('won', 'lost')`,
    [tenantId, userId]
  );
  const { total_deals = 0, total_value = 0 } = result.rows[0] ?? {};

  return (
    <KpiCard
      label="Pipeline của tôi"
      value={`${Number(total_value).toLocaleString('vi-VN')}đ`}
      subLabel={`${total_deals} deals đang xử lý`}
      trendDirection="neutral"
    />
  );
}

// ---- kpi.quota_progress -------------------------------------
export async function QuotaProgressWidget() {
  const [tenantId, userId] = await Promise.all([getTenantId(), getCurrentUserId()]);
  const result = await db.query(
    `SELECT COALESCE(SUM(value), 0) AS won_value
     FROM deals
     WHERE tenant_id = $1
       AND owner_id = $2
       AND stage = 'won'
       AND date_trunc('month', close_date) = date_trunc('month', now())`,
    [tenantId, userId]
  );
  const { won_value = 0 } = result.rows[0] ?? {};
  // TODO: fetch quota from user_settings when available; placeholder 350M
  const quota = 350_000_000;
  const pct = Math.min(Math.round((Number(won_value) / quota) * 100), 100);

  return (
    <KpiCard
      label="Đã chốt tháng này"
      value={`${Number(won_value).toLocaleString('vi-VN')}đ`}
      subLabel={`${pct}% quota (${Number(quota).toLocaleString('vi-VN')}đ)`}
      trendDirection={pct >= 80 ? 'up' : pct >= 50 ? 'neutral' : 'down'}
    />
  );
}

// ---- kpi.deals_stuck ----------------------------------------
export async function DealsStuckWidget() {
  const [tenantId, userId] = await Promise.all([getTenantId(), getCurrentUserId()]);
  const result = await db.query(
    `SELECT COUNT(*) AS stuck
     FROM deals
     WHERE tenant_id = $1
       AND owner_id = $2
       AND stage NOT IN ('won', 'lost')
       AND updated_at < now() - interval '7 days'`,
    [tenantId, userId]
  );
  const { stuck = 0 } = result.rows[0] ?? {};
  const isUrgent = Number(stuck) > 0;

  return (
    <KpiCard
      label="Deals cần action"
      value={`${stuck} deals`}
      subLabel="Không có activity > 7 ngày"
      urgent={isUrgent}
      trendDirection={isUrgent ? 'down' : 'neutral'}
    />
  );
}

// ---- kpi.tasks_today ----------------------------------------
export async function TasksTodayWidget() {
  const [tenantId, userId] = await Promise.all([getTenantId(), getCurrentUserId()]);
  const result = await db.query(
    `SELECT COUNT(*) AS tasks_count
     FROM activities
     WHERE tenant_id = $1
       AND assigned_to = $2
       AND type = 'task'
       AND completed = false
       AND due_date::date = CURRENT_DATE`,
    [tenantId, userId]
  );
  const { tasks_count = 0 } = result.rows[0] ?? {};

  return (
    <KpiCard
      label="Tasks hôm nay"
      value={`${tasks_count} tasks`}
      subLabel="Follow-up + cuộc gọi"
      trendDirection="neutral"
    />
  );
}
