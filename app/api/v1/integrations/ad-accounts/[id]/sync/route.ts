import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { toggleAdAccountSync } from '@/core/engine/integrations';

export const PATCH = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId!;
    const accountId = ctx?.params?.id;
    
    if (!accountId) {
      return ApiResponse.error('Account ID is required', 400);
    }

    const { enabled } = await req.json();

    if (typeof enabled !== 'boolean') {
      return ApiResponse.error('Field "enabled" is required and must be boolean', 400);
    }

    const success = await toggleAdAccountSync(tenantId, accountId, enabled);
    
    if (!success) {
      return ApiResponse.error('Ad account not found', 404, {}, ErrorCodes.NOT_FOUND);
    }

    return ApiResponse.success({ enabled });
  } catch (error) {
    return ApiResponse.serverError(error, 'integrations.ad-account.toggle');
  }
});

