import { db } from '@/core/engine/db';
import type { PoolClient } from 'pg';

export async function syncFacebookPages(data: { tenantId: string; pageId: string; date?: string }) {
  const { tenantId, pageId } = data;
  const targetDate = data.date || getYesterdayFormatted();

  console.log(`[Job: sync-facebook-page] Processing Page ${pageId} for date ${targetDate}`);

  // 1. Get Page info and Access Token
  const pageRes = await db.query(`
    SELECT external_page_id, name, access_token
    FROM social_pages 
    WHERE id = $1 AND tenant_id = $2 AND is_sync_enabled = true
  `, [pageId, tenantId]);

  if (pageRes.rows.length === 0) {
    console.log(`[Job: sync-facebook-page] Page ${pageId} not found or sync disabled`);
    return;
  }

  const { external_page_id, name, access_token } = pageRes.rows[0];

  if (!access_token) {
    throw new Error(`[Job: sync-facebook-page] No Page Access Token available for ${name}`);
  }

  // 2. Fetch Page Insights from Graph API
  // Metrics: page_impressions_unique (Reach), page_engaged_users (Engagement), page_follows (New Followers)
  const metricsToFetch = 'page_impressions_unique,page_engaged_users,page_follows';
  
  // Facebook requires 'since' and 'until', we fetch the exact day.
  const insightsUrl = `https://graph.facebook.com/v20.0/${external_page_id}/insights?metric=${metricsToFetch}&period=day&since=${targetDate}&until=${targetDate}&access_token=${access_token}`;
  
  const fbRes = await fetch(insightsUrl);
  const fbData = await fbRes.json();

  if (fbData.error) {
    console.error(`[Job: sync-facebook-page] Graph API Error:`, fbData.error);
    throw new Error(fbData.error.message);
  }

  // Parse metrics
  let reach = 0;
  let engagement = 0;
  let newFollowers = 0;

  if (fbData.data && Array.isArray(fbData.data)) {
    for (const metric of fbData.data) {
      // Metric objects have 'values' array. We take the first one (0th index)
      const val = metric.values && metric.values.length > 0 ? metric.values[0].value : 0;
      
      if (metric.name === 'page_impressions_unique') reach = val;
      if (metric.name === 'page_engaged_users') engagement = val;
      if (metric.name === 'page_follows') newFollowers = val;
    }
  }

  // 3. Upsert Metrics
  await db.withTenantTransaction(tenantId, async (client: PoolClient) => {
    await client.query(`
      INSERT INTO social_page_metrics 
        (page_id, date, reach, engagement, new_followers)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (page_id, date) DO UPDATE 
      SET reach = EXCLUDED.reach,
          engagement = EXCLUDED.engagement,
          new_followers = EXCLUDED.new_followers,
          updated_at = NOW()
    `, [pageId, targetDate, reach, engagement, newFollowers]);

    // 4. Update last_synced_at timestamp on the Page
    await client.query(`
      UPDATE social_pages SET last_synced_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
    `, [pageId, tenantId]);
  });

  console.log(`[Job: sync-facebook-page] Completed: ${name} (Reach: ${reach}, Eng: ${engagement}, Follows: ${newFollowers})`);
}

function getYesterdayFormatted(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
