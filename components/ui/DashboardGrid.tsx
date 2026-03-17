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
// =============================================================

import type { DashboardWidgetRow } from '@/templates/engine/template.schema';

// =============================================================
// WIDGET_MAP — maps widgetId string → React component.
// Add new widget components here as modules are built.
// Each widget is a self-contained card that fetches its own data.
// =============================================================

function PlaceholderWidget({ widgetId }: { widgetId: string }) {
  return (
    <div className="dashboard-widget dashboard-widget--placeholder">
      <span className="dashboard-widget__label">{widgetId}</span>
      <p className="dashboard-widget__hint">Widget coming soon</p>
    </div>
  );
}

// Import real widgets here as they are built:
//   import RevenueTodayWidget from '@/modules/reports/widgets/RevenueTodayWidget';
//   ...

const WIDGET_MAP: Record<string, React.ComponentType<{ widgetId: string }>> = {
  // Populated as modules are built — all fall back to PlaceholderWidget
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
