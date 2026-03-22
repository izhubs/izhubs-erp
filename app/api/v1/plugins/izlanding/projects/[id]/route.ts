import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { getProject, updateProject, deleteProject, UpdateProjectSchema } from '@/core/engine/izlanding';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/plugins/izlanding/projects/[id]
 */
export const GET = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const projectId = ctx?.params?.id;
    if (!projectId) return ApiResponse.error('Project ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const project = await getProject(tenantId, projectId);
    if (!project) return ApiResponse.error('Landing page not found', 404, {}, ErrorCodes.NOT_FOUND);
    return ApiResponse.success(project);
  } catch (err) {
    return ApiResponse.serverError(err, 'GET /api/v1/plugins/izlanding/projects/[id]');
  }
});

/**
 * PUT /api/v1/plugins/izlanding/projects/[id]
 */
export const PUT = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const projectId = ctx?.params?.id;
    if (!projectId) return ApiResponse.error('Project ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const body = await req.json();
    const parsed = UpdateProjectSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const project = await updateProject(tenantId, projectId, parsed.data);
    if (!project) return ApiResponse.error('Landing page not found', 404, {}, ErrorCodes.NOT_FOUND);
    return ApiResponse.success(project);
  } catch (err) {
    return ApiResponse.serverError(err, 'PUT /api/v1/plugins/izlanding/projects/[id]');
  }
});

/**
 * DELETE /api/v1/plugins/izlanding/projects/[id]
 */
export const DELETE = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const projectId = ctx?.params?.id;
    if (!projectId) return ApiResponse.error('Project ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const ok = await deleteProject(tenantId, projectId);
    if (!ok) return ApiResponse.error('Landing page not found', 404, {}, ErrorCodes.NOT_FOUND);
    return ApiResponse.success({ deleted: true });
  } catch (err) {
    return ApiResponse.serverError(err, 'DELETE /api/v1/plugins/izlanding/projects/[id]');
  }
});
