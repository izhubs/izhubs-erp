/**
 * GET /api/v1/import/[id] — job status + progress
 */

import { NextRequest } from 'next/server';
import { getImportJob } from '@/core/engine/import';
import { ApiResponse } from '@/core/engine/response';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = req.headers.get('x-tenant-id') ?? '00000000-0000-0000-0000-000000000001';
    const job = await getImportJob(params.id, tenantId);
    if (!job) return ApiResponse.error('Import job not found', 404);
    return ApiResponse.success(job);
  } catch (error) {
    return ApiResponse.serverError(error, 'import.status');
  }
}
