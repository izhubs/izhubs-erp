/**
 * POST /api/v1/import
 * Upload a CSV file, parse headers + sample rows, run AI mapping, return proposal.
 * Body: multipart/form-data with `file` (CSV) + `entityType` (contacts | deals)
 */

import { NextRequest } from 'next/server';
import Papa from 'papaparse';
import { z } from 'zod';
import { createImportJob } from '@/core/engine/import';
import { ApiResponse } from '@/core/engine/response';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const SAMPLE_ROWS = 5;

const QuerySchema = z.object({
  entityType: z.enum(['contacts', 'deals']),
});

export async function POST(req: NextRequest) {
  try {
    // Read multipart form
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const entityTypeRaw = formData.get('entityType') as string;

    if (!file) return ApiResponse.error('No file uploaded', 400);
    if (file.size > MAX_FILE_SIZE) return ApiResponse.error('File too large (max 5 MB)', 400);

    const parsed = QuerySchema.safeParse({ entityType: entityTypeRaw });
    if (!parsed.success) return ApiResponse.validationError(parsed.error);
    const { entityType } = parsed.data;

    // Parse CSV
    const csvText = await file.text();
    const result = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      return ApiResponse.error('Could not parse CSV file', 400, { details: result.errors[0].message });
    }

    const headers = result.meta.fields ?? [];
    const allRows = result.data;
    const sample = allRows.slice(0, SAMPLE_ROWS);

    if (headers.length === 0) return ApiResponse.error('CSV has no column headers', 400);

    // Get tenant from JWT (middleware injects x-tenant-id header)
    const tenantId = req.headers.get('x-tenant-id') ?? '00000000-0000-0000-0000-000000000001';

    const { jobId, mapping } = await createImportJob(tenantId, file.name, entityType, headers, sample);

    return ApiResponse.success({
      jobId,
      mapping,
      sample,
      headers,
      totalRows: allRows.length,
    }, 201);
  } catch (error) {
    return ApiResponse.serverError(error, 'import.upload');
  }
}
