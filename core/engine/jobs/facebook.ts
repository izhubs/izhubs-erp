import { db } from '@/core/engine/db';
import type { PoolClient } from 'pg';

export async function syncFacebookAds(data: { tenantId: string; adAccountId: string; date?: string }) {
  const { tenantId, adAccountId } = data;
  const targetDate = data.date || getYesterdayFormatted();

  console.log(`[Job: sync-facebook] Processing account ${adAccountId} for date ${targetDate}`);

  // 1. Get all mapped campaigns for this account
  const mappedCampaigns = await db.queryAsTenant(tenantId, `
    SELECT id, campaign_id, external_campaign_id, external_campaign_name
    FROM campaign_ad_sources
    WHERE ad_account_id = $1
  `, [adAccountId]);

  if (mappedCampaigns.rows.length === 0) {
    console.log(`[Job: sync-facebook] No campaigns mapped for account ${adAccountId}`);
    return;
  }

  // 2. Map mappedCampaigns for quick lookup by external_campaign_id
  const campaignMap = new Map(mappedCampaigns.rows.map(c => [c.external_campaign_id, c]));

  // 3. Fetch Token and External Account ID
  const accountRes = await db.query(`
    SELECT aa.external_account_id, ic.credentials
    FROM ad_accounts aa
    JOIN integration_connections ic ON aa.connection_id = ic.id
    WHERE aa.id = $1 AND aa.tenant_id = $2
  `, [adAccountId, tenantId]);

  if (accountRes.rows.length === 0) {
    console.log(`[Job: sync-facebook] Valid account/connection not found for ${adAccountId}`);
    return;
  }

  const { external_account_id, credentials } = accountRes.rows[0];
  const parsedCreds = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
  const accessToken = parsedCreds?.access_token;

  if (!accessToken) {
    throw new Error(`[Job: sync-facebook] No access token available for account ${external_account_id}`);
  }

  // 4. Call Facebook Graph API for Account Insights (Grouped by Campaign)
  const insightsUrl = `https://graph.facebook.com/v20.0/${external_account_id}/insights?time_range={'since':'${targetDate}','until':'${targetDate}'}&level=campaign&fields=campaign_id,spend,impressions,clicks,conversions&access_token=${accessToken}`;
  
  const fbRes = await fetch(insightsUrl);
  const fbData = await fbRes.json();

  if (fbData.error) {
    console.error(`[Job: sync-facebook] Graph API Error:`, fbData.error);
    throw new Error(fbData.error.message);
  }

  const insightsRecords: any[] = fbData.data || [];

  // 5. Upsert Metrics and Expenses
  await db.withTenantTransaction(tenantId, async (client: PoolClient) => {
    for (const record of insightsRecords) {
      const extCampaignId = record.campaign_id;
      const mapping = campaignMap.get(extCampaignId);

      // Only process campaigns that the user mapped in the izhubs-erp UI
      if (!mapping) continue;

      const spend = parseFloat(record.spend || '0').toFixed(2);
      const impressions = parseInt(record.impressions || '0', 10);
      const clicks = parseInt(record.clicks || '0', 10);
      const conversions = parseInt(record.conversions || '0', 10);

      // Upsert into campaign_digital_metrics
      await client.query(`
        INSERT INTO campaign_digital_metrics 
          (campaign_id, ad_account_id, date, platform, spend, impressions, clicks, conversions)
        VALUES ($1, $2, $3, 'facebook_ads', $4, $5, $6, $7)
        ON CONFLICT (campaign_id, ad_account_id, date) DO UPDATE 
        SET spend = EXCLUDED.spend,
            impressions = EXCLUDED.impressions,
            clicks = EXCLUDED.clicks,
            conversions = EXCLUDED.conversions,
            updated_at = NOW()
      `, [mapping.campaign_id, adAccountId, targetDate, spend, impressions, clicks, conversions]);

      // Auto-generate Expense (Only if there was spend today)
      if (parseFloat(spend) > 0) {
        await client.query(`
          INSERT INTO expense_records
            (tenant_id, campaign_id, category, amount, status, date, notes, source_type)
          VALUES ($1, $2, 'advertising', $3, 'paid', $4, $5, 'facebook_ads')
        `, [
          tenantId, 
          mapping.campaign_id, 
          spend, 
          targetDate, 
          `FB Ads Auto-Sync: ${mapping.external_campaign_name} (${targetDate})`
        ]);
      }
    }

    // Update last_synced_at on the Ad Account
    await client.query(`
      UPDATE ad_accounts SET last_synced_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
    `, [adAccountId, tenantId]);
  });

  console.log(`[Job: sync-facebook] Completed successfully for ${mappedCampaigns.rows.length} campaigns.`);
}

function getYesterdayFormatted(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
