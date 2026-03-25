import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { db } from '@/core/engine/db';

export const GET = withPermission('biz-ops:read', async (req, claims) => {
  try {
    const tenantId = claims.tenantId!;

    // 1. Summary Cards Data
    const summaryQuery = await db.queryAsTenant(tenantId, `
      SELECT 
        COALESCE(SUM(spend), 0) as total_spend,
        COALESCE(SUM(conversions), 0) as total_conversions
      FROM campaign_digital_metrics
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const totalSpend = parseFloat(summaryQuery.rows[0].total_spend);
    const totalConversions = parseInt(summaryQuery.rows[0].total_conversions, 10);
    const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

    // 2. ROAS Line Chart Data (Last 7 Days grouped)
    const roasQuery = await db.queryAsTenant(tenantId, `
      SELECT 
        TO_CHAR(date, 'Mon DD') as date_label,
        COALESCE(SUM(spend), 0) as ad_spend,
        COALESCE(SUM(conversions), 0) as conversions
      FROM campaign_digital_metrics
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date
      ORDER BY date ASC
    `);

    // 3. Platform Comparison (Last 30 Days)
    const platformQuery = await db.queryAsTenant(tenantId, `
      SELECT 
        platform,
        COALESCE(SUM(spend), 0) as ad_spend,
        COALESCE(SUM(conversions), 0) as conversions
      FROM campaign_digital_metrics
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY platform
    `);

    const platformData = platformQuery.rows.map((row: any) => ({
      platform: row.platform === 'facebook_ads' ? 'Facebook' : 'Google',
      adSpend: parseFloat(row.ad_spend),
      conversions: parseInt(row.conversions, 10)
    }));

    // 4. Campaign Leaderboard (Top 5 Active by Spend)
    const leaderboardQuery = await db.queryAsTenant(tenantId, `
      SELECT 
        c.id,
        c.name,
        MAX(m.platform) as source,
        COALESCE(SUM(m.spend), 0) as spend,
        COALESCE(SUM(m.conversions), 0) as conversions
      FROM biz_ops_campaigns c
      JOIN campaign_digital_metrics m ON c.id = m.campaign_id
      WHERE m.date >= CURRENT_DATE - INTERVAL '30 days'
        AND c.tenant_id = $1
      GROUP BY c.id, c.name
      ORDER BY spend DESC
      LIMIT 10
    `, [tenantId]);

    const campaigns = leaderboardQuery.rows.map((row: any) => {
      const spend = parseFloat(row.spend);
      const convs = parseInt(row.conversions, 10);
      return {
        id: row.id,
        name: row.name,
        source: row.source === 'facebook_ads' ? 'Facebook' : (row.source === 'google_ads' ? 'Google' : 'Mixed'),
        spend,
        conversions: convs,
        cpa: convs > 0 ? parseFloat((spend / convs).toFixed(2)) : 0,
        status: 'active' // In reality, fetch this from ad_accounts or campaign status
      };
    });

    return ApiResponse.success({
      summary: {
        totalSpend,
        avgCpa: parseFloat(avgCpa.toFixed(2))
      },
      roasData: roasQuery.rows.map((r: any) => ({
        date: r.date_label,
        adSpend: parseFloat(r.ad_spend),
        conversions: parseInt(r.conversions, 10)
      })),
      platformData,
      campaigns
    });

  } catch (error) {
    return ApiResponse.serverError(error, 'biz-ops.sync.dashboard');
  }
});
