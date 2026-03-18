#!/usr/bin/env tsx
// =============================================================
// izhubs ERP — CSV Import Worker
// Runs as a standalone process (separate from Next.js).
// Start:  npx tsx scripts/workers/import-worker.ts
// Or via PM2: pm2 start scripts/workers/import-worker.ts --interpreter tsx
// =============================================================

import type { Job } from 'bullmq';
import { createImportWorker, type ImportJobPayload } from '@/core/engine/import-queue';
import { db } from '@/core/engine/db';

const FIELD_MAP: Record<string, Record<string, string>> = {
  contacts: {
    name:    'name',
    email:   'email',
    phone:   'phone',
    company: 'company',
    type:    'type',
  },
  deals: {
    name:   'name',
    value:  'value',
    stage:  'stage',
  },
};

async function processImportJob(job: Job<ImportJobPayload>) {
  const { jobId, tenantId, entityType, csvRows, mapping } = job.data;
  const fields = FIELD_MAP[entityType] ?? {};

  let inserted = 0;
  let failed   = 0;

  // Update job status to processing
  await db.query(
    `UPDATE import_jobs SET status = 'processing', updated_at = NOW() WHERE id = $1`,
    [jobId]
  );

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];

    try {
      // Build mapped record
      const mapped: Record<string, unknown> = { tenant_id: tenantId };
      for (const [csvCol, entityField] of Object.entries(mapping)) {
        const dbField = fields[entityField];
        if (dbField && row[csvCol] !== undefined) {
          mapped[dbField] = row[csvCol];
        }
      }

      if (entityType === 'contacts') {
        await db.query(
          `INSERT INTO contacts (tenant_id, name, email, phone, type)
           VALUES ($1, $2, $3, $4, 'person')
           ON CONFLICT (tenant_id, email) DO UPDATE SET
             name  = EXCLUDED.name,
             phone = EXCLUDED.phone,
             updated_at = NOW()`,
          [
            tenantId,
            mapped.name ?? '',
            mapped.email ?? null,
            mapped.phone ?? null,
          ]
        );
      } else {
        await db.query(
          `INSERT INTO deals (tenant_id, name, value, stage)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [
            tenantId,
            mapped.name ?? 'Imported Deal',
            Number(mapped.value) || 0,
            (mapped.stage as string) ?? 'new',
          ]
        );
      }

      inserted++;
    } catch {
      failed++;
    }

    // Report progress every 50 rows
    if (i % 50 === 0) {
      await job.updateProgress(Math.round((i / csvRows.length) * 100));
    }
  }

  // Mark complete in DB
  await db.query(
    `UPDATE import_jobs
     SET status = 'completed', rows_imported = $1, rows_failed = $2, updated_at = NOW()
     WHERE id = $3`,
    [inserted, failed, jobId]
  );

  console.log(`[import-worker] Job ${jobId}: ${inserted} inserted, ${failed} failed`);
}

// Start the worker
const worker = createImportWorker(processImportJob);
console.log('🚀 CSV Import Worker started — waiting for jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — draining worker...');
  await worker.close();
  process.exit(0);
});
