import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { getSubmissions, convertToContact } from '@/core/engine/izform';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/plugins/izform/forms/[id]/submissions
 */
export const GET = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const formId = ctx?.params?.id;
    if (!formId) return ApiResponse.error('Form ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const submissions = await getSubmissions(tenantId, formId);
    return ApiResponse.success(submissions);
  } catch (err) {
    return ApiResponse.serverError(err, 'GET /api/v1/plugins/izform/forms/[id]/submissions');
  }
});
