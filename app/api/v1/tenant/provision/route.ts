import { ApiResponse } from '../../../../../core/engine/response';
import { provisionTenant } from '../../../../../core/engine/tenant';
import { getAuthClaims } from '../../../../../core/engine/rbac';
import { z } from 'zod';

const ProvisionSchema = z.object({
  templateId: z.string().min(1),
  includeDemoData: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  // Provision is a one-time self-setup: any authenticated user can call it.
  // No RBAC permission needed — the engine prevents double-provisioning.
  const claims = await getAuthClaims(req);
  if (!claims) {
    return ApiResponse.error('Unauthorized', 401);
  }

  try {
    const payload = await req.json();
    const config = ProvisionSchema.parse(payload);

    const result = await provisionTenant(claims.sub, {
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
