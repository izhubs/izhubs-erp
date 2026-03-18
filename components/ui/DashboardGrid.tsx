'use client';

// =============================================================
// izhubs ERP — DashboardGrid (Dumb Component)
// 12-column CSS Grid renderer.
// Renders purely from DashboardWidgetRow[] props.
// Maps widgetId string → widget component via WIDGET_MAP.
// Unknown widgetIds render a placeholder card.
//
// Data flow:
//   DB (industry_templates.nav_config.dashboardLayout) → layout.tsx → DashboardGrid props
//
// To add a new widget:
//   1. Create a Server Component in components/modules/*/widgets/
//   2. Import it below
//   3. Add entry to WIDGET_MAP — done.
// =============================================================

import type { DashboardWidgetRow } from '@/templates/engine/template.schema';

// ---- CEO Dashboard Widgets ----------------------------------
import {
  MrrWidget,
  CustomersWidget,
  ChurnWidget,
  ContractsExpiringWidget,
} from '@/components/modules/reports/widgets/CeoKpiWidgets';

// ---- Sales Dashboard Widgets --------------------------------
import {
  MyPipelineWidget,
  QuotaProgressWidget,
  DealsStuckWidget,
  TasksTodayWidget,
} from '@/components/modules/reports/widgets/SalesKpiWidgets';

// ---- Chart Widgets (Phase 2b) — recharts lazy-loaded Server Components --
import {
  ArrTrendWidget,
  RevenueByPackageWidget,
  PipelineFunnelWidget,
} from '@/components/modules/reports/widgets/ChartWidgets';
import { TopCustomersWidget } from '@/components/modules/reports/widgets/TopCustomersWidget';
import { ActivityFeedWidget } from '@/components/modules/reports/widgets/ActivityFeedWidget';

// ---- Marketing Dashboard Widgets ----------------------------
import {
  LeadsMonthWidget,
  ConversionRateWidget,
  CacWidget,
} from '@/components/modules/reports/widgets/MarketingKpiWidgets';

// =============================================================
// WIDGET_MAP
// Key = widgetId string from navConfig.dashboardLayout.rows[].widgetId
// Value = self-fetching Server Component
// =============================================================

function PlaceholderWidget({ widgetId }: { widgetId: string }) {
  return (
    <div className="dashboard-widget dashboard-widget--placeholder">
      <span className="dashboard-widget__label">{widgetId}</span>
      <p className="dashboard-widget__hint">Widget coming soon</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WIDGET_MAP: Record<string, React.ComponentType<any>> = {
  // ---- CEO ----
  'kpi.mrr':                  MrrWidget,
  'kpi.customers':            CustomersWidget,
  'kpi.churn':                ChurnWidget,
  'kpi.contracts_expiring':   ContractsExpiringWidget,

  // ---- Sales ----
  'kpi.my_pipeline':          MyPipelineWidget,
  'kpi.quota_progress':       QuotaProgressWidget,
  'kpi.deals_stuck':          DealsStuckWidget,
  'kpi.tasks_today':          TasksTodayWidget,

  // ---- Marketing ----
  'kpi.leads_month':          LeadsMonthWidget,
  'kpi.conversion_rate':      ConversionRateWidget,
  'kpi.cac':                  CacWidget,

  // Charts & tables — Phase 2b ✅
  'chart.arr_trend':          ArrTrendWidget,
  'chart.revenue_by_pkg':     RevenueByPackageWidget,
  'chart.pipeline_funnel':    PipelineFunnelWidget,
  'table.top_customers':      TopCustomersWidget,
  'feed.recent_activity':     ActivityFeedWidget,
};

function resolveWidget(widgetId: string) {
  return WIDGET_MAP[widgetId] ?? PlaceholderWidget;
}

// =============================================================

interface DashboardGridProps {
  /** Widget rows pre-filtered by role from lib/nav-config */
  rows: DashboardWidgetRow[];
}

export default function DashboardGrid({ rows }: DashboardGridProps) {
  return (
    <div className="dashboard-grid">
      {rows.map((row, idx) => {
        const Widget = resolveWidget(row.widgetId);
        return (
          <div
            key={`${row.widgetId}-${idx}`}
            className="dashboard-grid__cell"
            style={{ gridColumn: `span ${row.colSpan}` }}
          >
            <Widget widgetId={row.widgetId} />
          </div>
        );
      })}
    </div>
  );
}
