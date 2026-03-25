import { db } from '@/core/engine/db';
import type { PoolClient } from 'pg';
import { IAdSyncAdapter, SyncMetrics } from './IAdSyncAdapter';

export class GoogleAdsAdapter implements IAdSyncAdapter {
  
  async getTokens(tenantId: string, adAccountId: string) {
    const accountRes = await db.query(`
      SELECT aa.external_account_id, ic.credentials, aa.name as account_name
      FROM ad_accounts aa
      JOIN integration_connections ic ON aa.connection_id = ic.id
      WHERE aa.id = $1 AND aa.tenant_id = $2
    `, [adAccountId, tenantId]);

    if (accountRes.rows.length === 0) {
      throw new Error(`[Job: sync-google] Valid account/connection not found for ${adAccountId}`);
    }

    const { external_account_id, credentials, account_name } = accountRes.rows[0];
    const parsedCreds = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
    const accessToken = parsedCreds?.access_token;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    if (!accessToken) {
      throw new Error(`[Job: sync-google] No access token available for account ${external_account_id}`);
    }
    
    if (!developerToken) {
        throw new Error(`[Job: sync-google] Developer Token missing from environment variables`);
    }

    return { 
      externalAccountId: external_account_id, 
      accessToken, 
      developerToken,
      accountName: account_name 
    };
  }

  async fetchAccounts(accessToken: string): Promise<any> {
    const res = await fetch(`https://googleads.googleapis.com/v17/customers:listAccessibleCustomers`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
        }
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.resourceNames; // e.g. ["customers/1234567890"]
  }

  async fetchCampaigns(accountId: string, accessToken: string): Promise<any> {
    const query = `
      SELECT campaign.id, campaign.name, campaign.status 
      FROM campaign 
      WHERE campaign.status != 'REMOVED'
    `;
    
    const res = await fetch(`https://googleads.googleapis.com/v17/customers/${accountId}/googleAds:search`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.results;
  }

  async fetchDailyInsights(campaignId: string, targetDate: string, accessToken: string): Promise<SyncMetrics> {
    // This is optional if we fetch insights collectively in syncDailyInsights
    throw new Error('Not implemented for single campaign. Use syncDailyInsights.');
  }

  async syncDailyInsights(data: { tenantId: string; adAccountId: string; date?: string }): Promise<void> {
    const { tenantId, adAccountId } = data;
    const targetDate = data.date || getYesterdayFormatted();

    console.log(`[Job: sync-google] Processing account ${adAccountId} for date ${targetDate}`);

    const mappedCampaigns = await db.queryAsTenant(tenantId, `
      SELECT id, campaign_id, external_campaign_id, external_campaign_name
      FROM campaign_ad_sources
      WHERE ad_account_id = $1
    `, [adAccountId]);

    if (mappedCampaigns.rows.length === 0) {
      console.log(`[Job: sync-google] No campaigns mapped for account ${adAccountId}`);
      return;
    }

    const campaignMap = new Map(mappedCampaigns.rows.map((c: any) => [c.external_campaign_id, c]));

    const { externalAccountId, accessToken, developerToken } = await this.getTokens(tenantId, adAccountId);

    // Google Ads Query Language (GAQL)
    const query = `
      SELECT
        campaign.id,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM campaign
      WHERE segments.date >= '${targetDate}' AND segments.date <= '${targetDate}'
    `;

    const insightsUrl = `https://googleads.googleapis.com/v17/customers/${externalAccountId}/googleAds:search`;
    const googleRes = await fetch(insightsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    const googleData = await googleRes.json();

    if (googleData.error) {
      console.error(`[Job: sync-google] Google Ads API Error:`, googleData.error);
      throw new Error(googleData.error.message);
    }

    const insightsRecords: any[] = googleData.results || [];

    await db.withTenantTransaction(tenantId, async (client: PoolClient) => {
      for (const record of insightsRecords) {
        // google outputs id as number usually, but map as string
        const extCampaignId = record.campaign.id.toString();
        const mapping = campaignMap.get(extCampaignId);

        if (!mapping) continue;

        // cost_micros is in millionths of the account currency.
        const spendAmount = (Number(record.metrics.costMicros || 0) / 1000000).toFixed(2);
        const impressions = Number(record.metrics.impressions || 0);
        const clicks = Number(record.metrics.clicks || 0);
        const conversions = Number(record.metrics.conversions || 0);

        await client.query(`
          INSERT INTO campaign_digital_metrics 
            (campaign_id, ad_account_id, date, platform, spend, impressions, clicks, conversions)
          VALUES ($1, $2, $3, 'google_ads', $4, $5, $6, $7)
          ON CONFLICT (campaign_id, ad_account_id, date) DO UPDATE 
          SET spend = EXCLUDED.spend,
              impressions = EXCLUDED.impressions,
              clicks = EXCLUDED.clicks,
              conversions = EXCLUDED.conversions,
              updated_at = NOW()
        `, [mapping.campaign_id, adAccountId, targetDate, spendAmount, impressions, clicks, conversions]);

        if (Number(spendAmount) > 0) {
          await client.query(`
            INSERT INTO expense_records
              (tenant_id, campaign_id, category, amount, status, date, notes, source_type)
            VALUES ($1, $2, 'advertising', $3, 'paid', $4, $5, 'google_ads')
          `, [
            tenantId, 
            mapping.campaign_id, 
            spendAmount, 
            targetDate, 
            `Google Ads Auto-Sync: ${mapping.external_campaign_name} (${targetDate})`
          ]);
        }
      }

      await client.query(`
        UPDATE ad_accounts SET last_synced_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
      `, [adAccountId, tenantId]);
    });

    console.log(`[Job: sync-google] Completed successfully for ${mappedCampaigns.rows.length} campaigns.`);
  }
}

function getYesterdayFormatted(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
