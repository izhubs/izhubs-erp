import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { getFile, deleteFile } from '@/modules/biz-ops/engine/files';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { fileId: string };
  try {
    const fileRecord = await getFile(tenantId, params.fileId);
    if (!fileRecord) return ApiResponse.error('File not found', 404);
    return ApiResponse.success(fileRecord);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const DELETE = withModule('biz-ops', 'campaigns:delete', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { fileId: string };
  try {
    const success = await deleteFile(tenantId, params.fileId);
    if (!success) return ApiResponse.error('File not found', 404);
    return ApiResponse.success({ message: 'Deleted successfully' });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
