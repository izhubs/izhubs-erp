import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { listForms, createForm, CreateFormSchema } from '@/core/engine/izform';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/plugins/izform/forms
 * List all forms for the tenant.
 */
export const GET = withPermission('settings:manage', async (req, claims) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const forms = await listForms(tenantId);
    return ApiResponse.success(forms);
  } catch (err) {
    return ApiResponse.serverError(err, 'GET /api/v1/plugins/izform/forms');
  }
});

/**
 * POST /api/v1/plugins/izform/forms
 * Create a new form.
 */
export const POST = withPermission('settings:manage', async (req, claims) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const body = await req.json();
    const parsed = CreateFormSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }
    const form = await createForm(tenantId, parsed.data);
    return ApiResponse.success(form, 201);
  } catch (err) {
    return ApiResponse.serverError(err, 'POST /api/v1/plugins/izform/forms');
  }
});
