import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { sendTestWebhook, getForm } from '@/core/engine/izform';
import { z } from 'zod';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const TestWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
});

/**
 * POST /api/v1/plugins/izform/forms/[id]/webhook-test
 * Sends a test payload to the configured webhook URL.
 */
export const POST = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const formId = ctx?.params?.id;
    if (!formId) return ApiResponse.error('Form ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const body = await req.json();
    const parsed = TestWebhookSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const form = await getForm(tenantId, formId);
    const result = await sendTestWebhook(parsed.data.url, form?.name ?? 'Test Form');

    return ApiResponse.success({ status: result.status, message: `Webhook test sent — status ${result.status}` });
  } catch (err) {
    return ApiResponse.serverError(err, 'POST /api/v1/plugins/izform/forms/[id]/webhook-test');
  }
});
