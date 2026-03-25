import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queue';
import { syncFacebookAds } from './facebook';
import { syncFacebookPages } from './facebook_page';
import { initCronScheduler, triggerNightlySync } from './scheduler';

let worker: Worker | null = null;

export async function initSyncWorker() {
  if (worker) return worker;

  // Initialize the cron triggers into Redis once per startup
  await initCronScheduler();

  worker = new Worker('digital-sync', async (job: Job) => {
    switch (job.name) {
      case 'nightly-sync-trigger':
        await triggerNightlySync();
        break;
      case 'sync-facebook':
        await syncFacebookAds(job.data);
        break;
      case 'sync-facebook-page':
        await syncFacebookPages(job.data);
        break;
      case 'sync-google':
        console.log('Google Ads Sync not implemented yet.');
        break;
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }, { 
    connection: redisConnection,
    concurrency: 5 // Specified in SPEC: limit concurrency to handle API rate limits
  });

  console.log(`[BullMQ Worker] Started for 'digital-sync' queue`);
  return worker;
}
