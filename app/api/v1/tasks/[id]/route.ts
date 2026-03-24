import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { updateTask, deleteTask } from '@/packages/izerp-plugin/modules/iz-task/engine/tasks';

export const PUT = withPermission('activities:write', async (req, claims, context: any) => {
  try {
    const params = await context.params;
    const body = await req.json();

    const task = await updateTask(claims.tenantId!, params.id, body);
    if (!task) return ApiResponse.error('Task not found', 404, undefined, 'NOT_FOUND');
    
    return ApiResponse.success(task);
  } catch (error) {
    if ((error as any).name === 'ZodError') {
      return ApiResponse.validationError(error as any);
    }
    return ApiResponse.serverError(error, 'tasks.update');
  }
});

export const DELETE = withPermission('activities:write', async (req, claims, context: any) => {
  try {
    const params = await context.params;
    const deleted = await deleteTask(claims.tenantId!, params.id);
    if (!deleted) return ApiResponse.error('Task not found', 404, undefined, 'NOT_FOUND');
    
    return ApiResponse.success({ id: params.id, deleted: true });
  } catch (error) {
    return ApiResponse.serverError(error, 'tasks.delete');
  }
});
