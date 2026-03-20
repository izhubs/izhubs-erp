import { ApiResponse } from '../../../../../core/engine/response';
import { provisionTenant } from '../../../../../core/engine/tenant';
import { withPermission, type Claims } from '../../../../../core/engine/rbac';
import { z } from 'zod';

const ProvisionSchema = z.object({
  templateId: z.string().min(1),
  includeDemoData: z.boolean().optional().default(false),
});

async function provisionHandler(req: Request, claims: Claims) {
  try {
    const userId = claims.sub;
    if (!userId) {
      return ApiResponse.error('Unauthorized', 401);
    }

    const payload = await req.json();
    const config = ProvisionSchema.parse(payload);

    const result = await provisionTenant(userId, {
      templateId: config.templateId,
      includeDemoData: config.includeDemoData,
    });

    return ApiResponse.success({
      message: 'Tenant provisioned successfully',
      tenantId: result.tenantId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.validationError(error);
    }
    return ApiResponse.serverError(error);
  }
}

export const POST = withPermission('settings:manage', provisionHandler);
