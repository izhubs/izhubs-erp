import { db } from '../core/engine/db';
import { triggerNightlySync } from '../core/engine/jobs/scheduler';

async function setupMockData() {
  console.log('Seeding Mock Data for Sync testing...');
  const tenantRes = await db.query('SELECT id FROM tenants LIMIT 1');
  const tenantId = tenantRes.rows[0]?.id;
  if (!tenantId) throw new Error('No tenant found');

  const userRes = await db.query('SELECT id FROM users WHERE tenant_id = $1 LIMIT 1', [tenantId]);
  const userId = userRes.rows[0]?.id || tenantId; // fallback to tenantId just for fake insertion

  const connRes = await db.query(`
    INSERT INTO integration_connections (tenant_id, user_id, provider, credentials, status)
    VALUES ($1, $2, 'facebook', '{}', 'active')
    ON CONFLICT (user_id, provider) DO UPDATE SET status = 'active'
    RETURNING id
  `, [tenantId, userId]);
  const connectionId = connRes.rows[0].id;

  const adAccountsRes = await db.query(`
    INSERT INTO ad_accounts (tenant_id, connection_id, platform, external_account_id, name, is_sync_enabled)
    VALUES ($1, $2, 'facebook_ads', 'act_fake_sync_999', 'Fake Sync Agency', true)
    ON CONFLICT (tenant_id, platform, external_account_id) DO UPDATE SET is_sync_enabled = true
    RETURNING id
  `, [tenantId, connectionId]);
  
  const accountId = adAccountsRes.rows[0].id;

  // Create mock campaign
  const campaignRes = await db.query(`
    INSERT INTO campaigns (tenant_id, name, type, stage, health) 
    VALUES ($1, 'Mega Sale Campaign Q4', 'ads', 'planning', 'healthy') RETURNING id
  `, [tenantId]);
  const campaignId = campaignRes.rows[0].id;

  // Map campaign
  await db.query(`
    INSERT INTO campaign_ad_sources (campaign_id, ad_account_id, external_campaign_id, external_campaign_name)
    VALUES ($1, $2, 'ext_camp_123', 'Facebook Meta 2026 Test')
    ON CONFLICT DO NOTHING
  `, [campaignId, accountId]);

  console.log('Mock campaign mapped successfully. Triggering BullMQ Fan-out...');
  
  // Actually run the trigger
  await triggerNightlySync();
  console.log('Jobs enqueued! Wait for worker logs in nextjs dev console.');
  process.exit(0);
}

setupMockData().catch(console.error);
