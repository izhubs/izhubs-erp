export interface SyncMetrics {
  spend: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface IAdSyncAdapter {
  /**
   * Syncs daily insights for an ad account into the system.
   * This is the orchestrator method.
   */
  syncDailyInsights(data: { tenantId: string; adAccountId: string; date?: string }): Promise<void>;

  /**
   * Gets tokens and credentials for an ad account.
   */
  getTokens(tenantId: string, adAccountId: string): Promise<any>;

  /**
   * Fetches active accounts accessible by this connection.
   */
  fetchAccounts(accessToken: string): Promise<any>;

  /**
   * Fetches campaigns for a given external account.
   */
  fetchCampaigns(accountId: string, accessToken: string): Promise<any>;

  /**
   * Fetches daily insights for a given campaign.
   */
  fetchDailyInsights(campaignId: string, targetDate: string, accessToken: string): Promise<SyncMetrics>;
}
