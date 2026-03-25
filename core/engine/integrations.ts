import { db } from './db';
import { z } from 'zod';

export const IntegrationConnectionSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  provider: z.enum(['facebook', 'google_ads', 'tiktok']),
  credentials: z.any().optional(), // Kept private intentionally
  status: z.enum(['active', 'disconnected', 'error']),
  created_at: z.date(),
  updated_at: z.date(),
});

export type IntegrationConnection = z.infer<typeof IntegrationConnectionSchema>;

export const AdAccountSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  connection_id: z.string().uuid(),
  platform: z.enum(['facebook_ads', 'google_ads', 'tiktok_ads']),
  external_account_id: z.string(),
  name: z.string(),
  currency: z.string(),
  timezone: z.string().nullable(),
  is_sync_enabled: z.boolean(),
  last_synced_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type AdAccount = z.infer<typeof AdAccountSchema>;

export const SocialPageSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  connection_id: z.string().uuid(),
  platform: z.string(),
  external_page_id: z.string(),
  name: z.string(),
  is_sync_enabled: z.boolean(),
  last_synced_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type SocialPage = z.infer<typeof SocialPageSchema>;

// FETCH CONNECTIONS
export async function getIntegrationConnections(tenantId: string): Promise<IntegrationConnection[]> {
  const result = await db.queryAsTenant(
    tenantId,
    `SELECT id, tenant_id, user_id, provider, status, created_at, updated_at 
     FROM integration_connections 
     WHERE tenant_id = $1
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return result.rows || [];
}

// FETCH AD ACCOUNTS
export async function getAdAccounts(tenantId: string): Promise<AdAccount[]> {
  const result = await db.queryAsTenant(
    tenantId,
    `SELECT id, tenant_id, connection_id, platform, external_account_id, name, currency, timezone, is_sync_enabled, last_synced_at, created_at, updated_at
     FROM ad_accounts 
     WHERE tenant_id = $1
     ORDER BY name ASC`,
    [tenantId]
  );
  return result.rows || [];
}

// FETCH SOCIAL PAGES
export async function getSocialPages(tenantId: string): Promise<SocialPage[]> {
  const result = await db.queryAsTenant(
    tenantId,
    `SELECT id, tenant_id, connection_id, platform, external_page_id, name, is_sync_enabled, last_synced_at, created_at, updated_at
     FROM social_pages 
     WHERE tenant_id = $1
     ORDER BY name ASC`,
    [tenantId]
  );
  return result.rows || [];
}

// TOGGLE AD ACCOUNT SYNC
export async function toggleAdAccountSync(tenantId: string, accountId: string, enabled: boolean): Promise<boolean> {
  const result = await db.queryAsTenant(
    tenantId,
    `UPDATE ad_accounts 
     SET is_sync_enabled = $1, updated_at = NOW() 
     WHERE id = $2 AND tenant_id = $3
     RETURNING id`,
    [enabled, accountId, tenantId]
  );
  return (result.rowCount ?? 0) > 0;
}

// TOGGLE SOCIAL PAGE SYNC
export async function toggleSocialPageSync(tenantId: string, pageId: string, enabled: boolean): Promise<boolean> {
  const result = await db.queryAsTenant(
    tenantId,
    `UPDATE social_pages 
     SET is_sync_enabled = $1, updated_at = NOW() 
     WHERE id = $2 AND tenant_id = $3
     RETURNING id`,
    [enabled, pageId, tenantId]
  );
  return (result.rowCount ?? 0) > 0;
}

