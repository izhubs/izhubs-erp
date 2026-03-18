// =============================================================
// izhubs ERP — BullMQ Import Queue
// Offloads CSV ingestion to background worker.
// Queue: 'csv-import' → handles row-by-row upsert.
//
// Architecture:
//   POST /api/v1/import → createImportJob() → addImportJob() → Queue
//   Worker (scripts/workers/import-worker.ts) → processes job
//   Job progress stored in import_jobs table + Redis for real-time UI
// =============================================================

import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

// ---- Redis connection ----------------------------------------
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

let _connection: IORedis | null = null;

function getRedis(): IORedis {
  if (!_connection) {
    _connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null, // required by BullMQ
    });
  }
  return _connection;
}

// ---- Queue definition ----------------------------------------
const QUEUE_NAME = 'csv-import';

let _importQueue: Queue<ImportJobPayload> | null = null;

export interface ImportJobPayload {
  jobId:       string;    // import_jobs.id (UUID)
  tenantId:    string;
  entityType:  'contacts' | 'deals';
  csvRows:     Record<string, string>[];
  mapping:     Record<string, string>;   // csvColumn → entityField
  fileName:    string;
}

/**
 * Get (or create) the singleton CSV import queue.
 * Call from API route handlers only.
 */
export function getImportQueue(): Queue<ImportJobPayload> {
  if (!_importQueue) {
    _importQueue = new Queue<ImportJobPayload>(QUEUE_NAME, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts:    3,
        backoff:     { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 }, // keep last 100 completed
        removeOnFail:    { count: 50 },
      },
    });
  }
  return _importQueue;
}

/**
 * Enqueue a CSV import job.
 * Called after AI mapping proposal is accepted by user.
 */
export async function addImportJob(payload: ImportJobPayload): Promise<string> {
  const queue = getImportQueue();
  const job = await queue.add(`import:${payload.jobId}`, payload, {
    jobId: payload.jobId, // deduplicate by jobId
  });
  return job.id ?? payload.jobId;
}

// ---- Worker (run separately via `tsx scripts/workers/import-worker.ts`) ---
// This function is exported so the worker script can call it.
export type ImportJobHandler = (job: Job<ImportJobPayload>) => Promise<void>;

/**
 * Create the CSV import worker.
 * Import handler is injected to avoid circular deps.
 */
export function createImportWorker(handler: ImportJobHandler): Worker<ImportJobPayload> {
  const worker = new Worker<ImportJobPayload>(QUEUE_NAME, handler, {
    connection: getRedis(),
    concurrency: 3, // process up to 3 imports in parallel
  });

  worker.on('completed', job => {
    console.log(`[import-worker] ✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[import-worker] ❌ Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
