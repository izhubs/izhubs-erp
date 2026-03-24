import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { listFilesByCampaign, createFile, CreateFileSchema } from '@izerp-plugin/modules/biz-ops/engine/files';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { id: string };
  try {
    const files = await listFilesByCampaign(tenantId, params.id);
    return ApiResponse.success(files);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const POST = withModule('biz-ops', 'campaigns:write', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { id: string };
  try {
    const body = await req.json();
    // Validate payload, merge campaign_id from URL
    const parsed = CreateFileSchema.safeParse({ ...body, campaign_id: params.id });
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const fileRecord = await createFile(tenantId, parsed.data);
    return ApiResponse.success(fileRecord);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
