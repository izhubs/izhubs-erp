import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { getTask, updateTask, deleteTask, UpdateTaskSchema } from '@/modules/biz-ops/engine/tasks';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { taskId: string };
  try {
    const task = await getTask(tenantId, params.taskId);
    if (!task) return ApiResponse.error('Task not found', 404);
    return ApiResponse.success(task);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const PATCH = withModule('biz-ops', 'campaigns:write', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { taskId: string };
  try {
    const body = await req.json();
    const parsed = UpdateTaskSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const task = await updateTask(tenantId, params.taskId, parsed.data);
    if (!task) return ApiResponse.error('Task not found', 404);
    return ApiResponse.success(task);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const DELETE = withModule('biz-ops', 'campaigns:delete', async (req, claims, ctx) => {
  const tenantId = claims.tenantId!;
  const params = ctx?.params as { taskId: string };
  try {
    const success = await deleteTask(tenantId, params.taskId);
    if (!success) return ApiResponse.error('Task not found', 404);
    return ApiResponse.success({ message: 'Deleted successfully' });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
