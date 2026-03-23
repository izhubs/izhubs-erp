import { NextResponse } from 'next/server';
import { verifyJwt } from '@/core/engine/auth';
import { getEffectiveRole } from '@/core/engine/auth/server-context';
import { getDashboardConfig, aggregateWidgetData, DashboardLayout } from '@/core/engine/dashboard';

/**
 * GET /api/v1/dashboard/BFF?module=xxx
 * The Backend-For-Frontend endpoint that orchestrates Dashboard data fetching.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const moduleSlug = searchParams.get('module') || 'default';

    // Verify token to ensure authenticity, but we use getEffectiveRole (server context)
    // which simulates "View-As" functionality if the SuperAdmin has the cookie set.
    const token = authHeader.split(' ')[1];
    await verifyJwt(token); // throws if invalid

    const role = await getEffectiveRole();

    // 1. Fetch layout from dashboard_configs (DB Layer)
    const config = await getDashboardConfig(moduleSlug, role);

    if (!config) {
      return NextResponse.json({ 
        error: 'Dashboard configuration not found',
        code: 'MISSING_CONFIG'
      }, { status: 404 });
    }

    const layout = config.layout_json as DashboardLayout;
    
    // 2. Aggregate Data using Promise.all (BFF Layer)
    // Extract base URL for internal API calls (e.g. http://localhost:1303)
    const baseUrl = req.url.split('/api/')[0];
    const widgetData = await aggregateWidgetData(layout.grid, baseUrl, authHeader);

    // 3. Construct unified payload
    const payload = {
      meta: {
        config_id: config.id,
        name: config.name,
        slug: config.slug,
        effective_role: role,
        layout_id: layout.layout_id
      },
      grid: layout.grid.map(widget => ({
        ...widget,
        data: widgetData[widget.id] || null // Inject the aggregated data into the grid
      }))
    };

    return NextResponse.json({ data: payload });

  } catch (err: any) {
    console.error('BFF /api/v1/dashboard error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
