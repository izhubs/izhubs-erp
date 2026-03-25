import { db } from '@/core/engine/db';
import type { PoolClient } from 'pg';
import { IAdSyncAdapter, SyncMetrics } from './IAdSyncAdapter';

export class FacebookAdsAdapter implements IAdSyncAdapter {
  
  async getTokens(tenantId: string, adAccountId: string) {
    const accountRes = await db.query(`
      SELECT aa.external_account_id, ic.credentials, aa.name as account_name
      FROM ad_accounts aa
      JOIN integration_connections ic ON aa.connection_id = ic.id
      WHERE aa.id = $1 AND aa.tenant_id = $2
    `, [adAccountId, tenantId]);

    if (accountRes.rows.length === 0) {
      throw new Error(`[Job: sync-facebook] Valid account/connection not found for ${adAccountId}`);
    }

    const { external_account_id, credentials, account_name } = accountRes.rows[0];
    const parsedCreds = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
    const accessToken = parsedCreds?.access_token;

    if (!accessToken) {
      throw new Error(`[Job: sync-facebook] No access token available for account ${external_account_id}`);
    }

    return { externalAccountId: external_account_id, accessToken, accountName: account_name };
  }

  async fetchAccounts(accessToken: string): Promise<any> {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/adaccounts?fields=name,account_id,currency,timezone_name&access_token=${accessToken}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.data;
  }

  async fetchCampaigns(accountId: string, accessToken: string): Promise<any> {
    const res = await fetch(`https://graph.facebook.com/v20.0/${accountId}/campaigns?fields=name,status&access_token=${accessToken}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.data;
  }

  async fetchDailyInsights(campaignId: string, targetDate: string, accessToken: string): Promise<SyncMetrics> {
    // This is optional since facebook graph API supports grouping by campaigns on the account level.
    // However, adhering to the interface:
    const url = `https://graph.facebook.com/v20.0/${campaignId}/insights?time_range={'since':'${targetDate}','until':'${targetDate}'}&fields=spend,impressions,clicks,conversions&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) throw new Error(data.error.message);

    if (!data.data || data.data.length === 0) {
      return { spend: '0', impressions: 0, clicks: 0, conversions: 0 };
    }

    const record = data.data[0];
    return {
      spend: parseFloat(record.spend || '0').toFixed(2),
      impressions: parseInt(record.impressions || '0', 10),
      clicks: parseInt(record.clicks || '0', 10),
      conversions: parseInt(record.conversions || '0', 10),
    };
  }

  async syncDailyInsights(data: { tenantId: string; adAccountId: string; date?: string }): Promise<void> {
    const { tenantId, adAccountId } = data;
    const targetDate = data.date || getYesterdayFormatted();

    console.log(`[Job: sync-facebook] Processing account ${adAccountId} for date ${targetDate}`);

    const mappedCampaigns = await db.queryAsTenant(tenantId, `
      SELECT id, campaign_id, external_campaign_id, external_campaign_name
      FROM campaign_ad_sources
      WHERE ad_account_id = $1
    `, [adAccountId]);

    if (mappedCampaigns.rows.length === 0) {
      console.log(`[Job: sync-facebook] No campaigns mapped for account ${adAccountId}`);
      return;
    }

    const campaignMap = new Map(mappedCampaigns.rows.map((c: any) => [c.external_campaign_id, c]));

    const { externalAccountId, accessToken } = await this.getTokens(tenantId, adAccountId);

    // Call Facebook Graph API for Account Insights (Grouped by Campaign) - optimization over single campaign fetch
    const insightsUrl = `https://graph.facebook.com/v20.0/${externalAccountId}/insights?time_range={'since':'${targetDate}','until':'${targetDate}'}&level=campaign&fields=campaign_id,spend,impressions,clicks,conversions&access_token=${accessToken}`;
    const fbRes = await fetch(insightsUrl);
    const fbData = await fbRes.json();

    if (fbData.error) {
      console.error(`[Job: sync-facebook] Graph API Error:`, fbData.error);
      throw new Error(fbData.error.message);
    }

    const insightsRecords: any[] = fbData.data || [];

    await db.withTenantTransaction(tenantId, async (client: PoolClient) => {
      for (const record of insightsRecords) {
        const extCampaignId = record.campaign_id;
        const mapping = campaignMap.get(extCampaignId);

        if (!mapping) continue;

        const spend = parseFloat(record.spend || '0').toFixed(2);
        const impressions = parseInt(record.impressions || '0', 10);
        const clicks = parseInt(record.clicks || '0', 10);
        const conversions = parseInt(record.conversions || '0', 10);

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

      await client.query(`
        UPDATE ad_accounts SET last_synced_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
      `, [adAccountId, tenantId]);
    });

    console.log(`[Job: sync-facebook] Completed successfully for ${mappedCampaigns.rows.length} campaigns.`);
  }
}

function getYesterdayFormatted(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
