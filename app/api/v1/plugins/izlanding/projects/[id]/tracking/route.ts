import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { getPageTracking, updatePageTracking, PageTrackingSchema } from '@/core/engine/izlanding';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/plugins/izlanding/projects/[id]/tracking
 */
export const GET = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const projectId = ctx?.params?.id;
    if (!projectId) return ApiResponse.error('Project ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const tracking = await getPageTracking(projectId);
    return ApiResponse.success(tracking);
  } catch (err) {
    return ApiResponse.serverError(err, 'GET /api/v1/plugins/izlanding/projects/[id]/tracking');
  }
});

/**
 * PUT /api/v1/plugins/izlanding/projects/[id]/tracking
 */
export const PUT = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const projectId = ctx?.params?.id;
    if (!projectId) return ApiResponse.error('Project ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const body = await req.json();
    const parsed = PageTrackingSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const tracking = await updatePageTracking(projectId, parsed.data);
    return ApiResponse.success(tracking);
  } catch (err) {
    return ApiResponse.serverError(err, 'PUT /api/v1/plugins/izlanding/projects/[id]/tracking');
  }
});
