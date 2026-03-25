import { syncQueue } from '../queue';
import { db } from '@/core/engine/db';

export async function initCronScheduler() {
  // Add a repeatable cron job to the Queue
  await syncQueue.add(
    'nightly-sync-trigger',
    {},
    {
      repeat: {
        pattern: '0 2 * * *', // Run every day at 2:00 AM (server UTC)
      },
      jobId: 'system-nightly-sync-trigger', // Ensures idempotency in Redis
    }
  );
  console.log('[BullMQ Scheduler] Nightly Sync initialized at 2:00 AM UTC');
}

export async function triggerNightlySync() {
  console.log('[Job: nightly-sync-trigger] Searching for active Ad Accounts...');

  const jobs: any[] = [];

  // 1. Find all globally active ad accounts that have syncing enabled
  const accountsRes = await db.query(`
    SELECT id, tenant_id, platform 
    FROM ad_accounts 
    WHERE is_sync_enabled = true
  `);

  if (accountsRes.rows.length === 0) {
    console.log('[Job: nightly-sync-trigger] No active ad accounts found.');
  } else {
    // Fan-out: Map each active ad account to an individual job
    const adJobs = accountsRes.rows.map(acc => {
      let jobName = '';
      if (acc.platform === 'facebook_ads') jobName = 'sync-facebook';
      if (acc.platform === 'google_ads') jobName = 'sync-google';

      return {
        name: jobName,
        data: { tenantId: acc.tenant_id, adAccountId: acc.id },
        opts: {
          jobId: `sync-${acc.platform}-${acc.id}-${new Date().toISOString().split('T')[0]}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 }
        }
      };
    }).filter(j => j.name !== '');
    
    jobs.push(...adJobs);
  }

  // 2. Find all globally active Pages
  const pagesRes = await db.query(`
    SELECT id, tenant_id, platform 
    FROM social_pages 
    WHERE is_sync_enabled = true
  `);

  if (pagesRes.rows.length === 0) {
    console.log('[Job: nightly-sync-trigger] No active social pages found.');
  } else {
    const pageJobs = pagesRes.rows.map(page => {
      let jobName = '';
      if (page.platform === 'facebook_page') jobName = 'sync-facebook-page';
      
      return {
        name: jobName,
        data: { tenantId: page.tenant_id, pageId: page.id },
        opts: {
          jobId: `sync-${page.platform}-${page.id}-${new Date().toISOString().split('T')[0]}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 }
        }
      };
    }).filter(j => j.name !== '');

    jobs.push(...pageJobs);
  }

  if (jobs.length > 0) {
    await syncQueue.addBulk(jobs);
    console.log(`[Job: nightly-sync-trigger] Enqueued ${jobs.length} independent sync jobs into the cluster.`);
  } else {
    console.log('[Job: nightly-sync-trigger] No active entities to sync. Skipping operation.');
  }
}

