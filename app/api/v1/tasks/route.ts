import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { createTask, listTasksByEntity } from '@/packages/izerp-plugin/modules/iz-task/engine/tasks';

export const GET = withPermission('activities:read', async (req, claims) => {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    if (!entityType || !entityId) {
      return ApiResponse.error('Missing polymorphic refs: entity_type and entity_id required.', 400);
    }

    const tasks = await listTasksByEntity(claims.tenantId!, entityType, entityId);
    return ApiResponse.success(tasks);
  } catch (error) {
    return ApiResponse.serverError(error, 'tasks.list');
  }
});

export const POST = withPermission('activities:write', async (req, claims) => {
  try {
    const body = await req.json();
    const task = await createTask(claims.tenantId!, claims.sub!, body);
    return ApiResponse.success(task, 201);
  } catch (error) {
    if ((error as any).name === 'ZodError') {
      return ApiResponse.validationError(error as any);
    }
    return ApiResponse.serverError(error, 'tasks.create');
  }
});
