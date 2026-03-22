import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { listTasksByCampaign, createTask, CreateTaskSchema } from '@/modules/biz-ops/engine/tasks';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { id: string };
  try {
    const tasks = await listTasksByCampaign(tenantId, params.id);
    return ApiResponse.success(tasks);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const POST = withModule('biz-ops', 'campaigns:write', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { id: string };
  try {
    const body = await req.json();
    const parsed = CreateTaskSchema.safeParse({ ...body, campaign_id: params.id });
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const task = await createTask(tenantId, parsed.data);
    return ApiResponse.success(task);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
