import { db } from '@/core/engine/db';
import { getTenantId } from '@/core/engine/auth/server-context';

export interface DashboardWidget {
  id: string;
  type: 'SummaryCard' | 'ChartWidget' | 'DataTableWidget';
  w: number;
  h: number;
  x: number;
  y: number;
  endpoint: string;
  chart_type?: string;
  [key: string]: any;
}

export interface DashboardLayout {
  layout_id: string;
  grid: DashboardWidget[];
}

export interface DashboardConfig {
  id: string;
  name: string;
  slug: string;
  role: string;
  layout_json: DashboardLayout;
}

/**
 * Retrieves a dashboard configuration by its slug and the current active role.
 * Falls back to the default dashboard for that role if the exact slug isn't found,
 * or the default 'member' dashboard as a last resort.
 */
export async function getDashboardConfig(slug: string, role: string): Promise<DashboardConfig | null> {
  const tenantId = await getTenantId();

  // Try specific slug and role
  let res = await db.queryAsTenant(tenantId, 
    'SELECT * FROM dashboard_configs WHERE slug = $1 AND role = $2', 
    [slug, role]
  );

  // If not found, try default for role
  if (res.rows.length === 0) {
    res = await db.queryAsTenant(tenantId, 
      'SELECT * FROM dashboard_configs WHERE is_default = true AND role = $1 LIMIT 1', 
      [role]
    );
  }

  // If still not found, try default for member
  if (res.rows.length === 0) {
    res = await db.queryAsTenant(tenantId, 
      "SELECT * FROM dashboard_configs WHERE is_default = true AND role = 'member' LIMIT 1"
    );
  }

  if (res.rows.length === 0) return null;
  return res.rows[0];
}

/**
 * Fetches data for a given list of widgets over internal HTTP.
 * This acts as the BFF (Backend-For-Frontend) aggregator.
 */
export async function aggregateWidgetData(
  widgets: DashboardWidget[], 
  baseUrl: string,
  authHeader: string
) {
  const results: Record<string, any> = {};

  const fetchPromises = widgets.map(async (widget) => {
    if (!widget.endpoint) {
      results[widget.id] = { error: 'No endpoint defined' };
      return;
    }

    try {
      // Build absolute URL for the Server-to-Server internal fetch
      const url = new URL(widget.endpoint, baseUrl);
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': authHeader,
          // Forward internal caching rules or context if needed
          'x-internal-bff': 'true'
        },
        // We can leverage Next.js fetch cache here (TTL 15m)
        next: { revalidate: 900 } 
      });

      if (!response.ok) {
        results[widget.id] = { error: `Failed to fetch: ${response.statusText}` };
        return;
      }

      const json = await response.json();
      results[widget.id] = json.data || json;
    } catch (err: any) {
      results[widget.id] = { error: err.message };
    }
  });

  await Promise.all(fetchPromises);
  return results;
}
