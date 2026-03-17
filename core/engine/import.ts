/**
 * core/engine/import.ts
 * ============================================================
 * Import job lifecycle management.
 * Handles CSV parsing, job creation, ingestion of contacts/deals.
 * ============================================================
 */

import { db } from './db';
import { mapColumns, type ColumnMapping } from './import-ai';
import { z } from 'zod';

export type ImportEntityType = 'contacts' | 'deals';

export const ImportJobSchema = z.object({
  id:             z.string().uuid(),
  tenant_id:      z.string().uuid().nullable(),
  entity_type:    z.string(),
  status:         z.enum(['pending', 'processing', 'done', 'failed']),
  filename:       z.string().nullable(),
  total_rows:     z.number(),
  imported:       z.number(),
  failed:         z.number(),
  errors:         z.array(z.any()),
  column_mapping: z.record(z.string()),
  raw_sample:     z.array(z.record(z.any())),
  created_at:     z.string().or(z.date()),
  completed_at:   z.string().or(z.date()).nullable(),
});
export type ImportJob = z.infer<typeof ImportJobSchema>;

// ── Job creation ────────────────────────────────────────────

export async function createImportJob(
  tenantId: string,
  filename: string,
  entityType: ImportEntityType,
  headers: string[],
  sample: Record<string, string>[],
): Promise<{ jobId: string; mapping: ColumnMapping }> {
  // Build AI-assisted column mapping
  const mapping = await mapColumns(headers, entityType);

  const result = await db.query(
    `INSERT INTO import_jobs
       (tenant_id, entity_type, status, filename, column_mapping, raw_sample, total_rows)
     VALUES ($1, $2, 'pending', $3, $4, $5, 0)
     RETURNING id`,
    [tenantId, entityType, filename, JSON.stringify(mapping), JSON.stringify(sample)]
  );

  return { jobId: result.rows[0].id, mapping };
}

// ── Job status ──────────────────────────────────────────────

export async function getImportJob(jobId: string, tenantId: string): Promise<ImportJob | null> {
  const result = await db.query(
    `SELECT * FROM import_jobs WHERE id = $1 AND tenant_id = $2`,
    [jobId, tenantId]
  );
  if (!result.rowCount) return null;
  return ImportJobSchema.parse(result.rows[0]);
}

// ── Confirm + ingest ────────────────────────────────────────

export interface IngestionResult {
  imported: number;
  failed: number;
  errors: string[];
}

export async function runImport(
  jobId: string,
  tenantId: string,
  confirmedMapping: ColumnMapping,
  allRows: Record<string, string>[],
): Promise<IngestionResult> {
  // Mark as processing
  await db.query(
    `UPDATE import_jobs SET status = 'processing', column_mapping = $1, total_rows = $2 WHERE id = $3`,
    [JSON.stringify(confirmedMapping), allRows.length, jobId]
  );

  const job = await getImportJob(jobId, tenantId);
  if (!job) throw new Error('Import job not found');

  let imported = 0;
  const errors: string[] = [];

  if (job.entity_type === 'contacts') {
    ({ imported } = await ingestContacts(tenantId, allRows, confirmedMapping, errors));
  } else if (job.entity_type === 'deals') {
    ({ imported } = await ingestDeals(tenantId, allRows, confirmedMapping, errors));
  }

  const failed = allRows.length - imported;

  await db.query(
    `UPDATE import_jobs
     SET status = $1, imported = $2, failed = $3, errors = $4, completed_at = NOW()
     WHERE id = $5`,
    [errors.length === allRows.length ? 'failed' : 'done', imported, failed, JSON.stringify(errors.slice(0, 50)), jobId]
  );

  return { imported, failed, errors: errors.slice(0, 20) };
}

// ── Ingestors ───────────────────────────────────────────────

async function ingestContacts(
  tenantId: string,
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  errors: string[]
): Promise<{ imported: number }> {
  let imported = 0;

  for (const [i, row] of rows.entries()) {
    try {
      const name = get(row, mapping, 'name');
      if (!name) { errors.push(`Row ${i + 1}: missing name`); continue; }

      await db.query(
        `INSERT INTO contacts (tenant_id, name, email, phone, title)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [
          tenantId,
          name,
          get(row, mapping, 'email') || null,
          get(row, mapping, 'phone') || null,
          get(row, mapping, 'title') || null,
        ]
      );
      imported++;
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  return { imported };
}

async function ingestDeals(
  tenantId: string,
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  errors: string[]
): Promise<{ imported: number }> {
  let imported = 0;

  for (const [i, row] of rows.entries()) {
    try {
      const name = get(row, mapping, 'name');
      if (!name) { errors.push(`Row ${i + 1}: missing name`); continue; }

      const rawValue = get(row, mapping, 'value');
      const value = rawValue ? parseFloat(rawValue.replace(/[^0-9.]/g, '')) : 0;
      const stage = normalizeStage(get(row, mapping, 'stage'));

      await db.query(
        `INSERT INTO deals (tenant_id, name, value, stage)
         VALUES ($1, $2, $3, $4)`,
        [tenantId, name, isNaN(value) ? 0 : value, stage]
      );
      imported++;
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  return { imported };
}

// ── Helpers ─────────────────────────────────────────────────

/** Look up a row value by schema field name using the column mapping */
function get(row: Record<string, string>, mapping: ColumnMapping, field: string): string {
  const csvCol = Object.entries(mapping).find(([, v]) => v === field)?.[0];
  return csvCol ? (row[csvCol] ?? '').trim() : '';
}

const VALID_STAGES = new Set(['new','contacted','qualified','proposal','negotiation','won','lost','lead','onboarding','active','renewal']);
function normalizeStage(raw: string): string {
  const s = raw.toLowerCase().trim();
  return VALID_STAGES.has(s) ? s : 'new';
}
