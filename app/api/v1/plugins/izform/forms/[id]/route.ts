import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { getForm, updateForm, deleteForm, UpdateFormSchema } from '@/core/engine/izform';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/plugins/izform/forms/[id]
 */
export const GET = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const formId = ctx?.params?.id;
    if (!formId) return ApiResponse.error('Form ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const form = await getForm(tenantId, formId);
    if (!form) return ApiResponse.error('Form not found', 404, {}, ErrorCodes.NOT_FOUND);
    return ApiResponse.success(form);
  } catch (err) {
    return ApiResponse.serverError(err, 'GET /api/v1/plugins/izform/forms/[id]');
  }
});

/**
 * PUT /api/v1/plugins/izform/forms/[id]
 */
export const PUT = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const formId = ctx?.params?.id;
    if (!formId) return ApiResponse.error('Form ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const body = await req.json();
    const parsed = UpdateFormSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const form = await updateForm(tenantId, formId, parsed.data);
    if (!form) return ApiResponse.error('Form not found', 404, {}, ErrorCodes.NOT_FOUND);
    return ApiResponse.success(form);
  } catch (err) {
    return ApiResponse.serverError(err, 'PUT /api/v1/plugins/izform/forms/[id]');
  }
});

/**
 * DELETE /api/v1/plugins/izform/forms/[id]
 */
export const DELETE = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const formId = ctx?.params?.id;
    if (!formId) return ApiResponse.error('Form ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const ok = await deleteForm(tenantId, formId);
    if (!ok) return ApiResponse.error('Form not found', 404, {}, ErrorCodes.NOT_FOUND);
    return ApiResponse.success({ deleted: true });
  } catch (err) {
    return ApiResponse.serverError(err, 'DELETE /api/v1/plugins/izform/forms/[id]');
  }
});
