/**
 * POST /api/v1/import/[id]/confirm
 * User confirms (or adjusts) the AI-proposed column mapping.
 * Triggers actual ingestion from the original raw CSV data.
 *
 * Body: { mapping: Record<string, string>, rows: Record<string, string>[] }
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { runImport } from '@/core/engine/import';
import { ApiResponse } from '@/core/engine/response';

const ConfirmSchema = z.object({
  mapping: z.record(z.string()),
  rows: z.array(z.record(z.string())),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = ConfirmSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const { mapping, rows } = parsed.data;
    const tenantId = req.headers.get('x-tenant-id') ?? '00000000-0000-0000-0000-000000000001';

    const result = await runImport(params.id, tenantId, mapping, rows);
    return ApiResponse.success(result);
  } catch (error) {
    return ApiResponse.serverError(error, 'import.confirm');
  }
}
