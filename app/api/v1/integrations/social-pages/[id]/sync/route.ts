import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { toggleSocialPageSync } from '@/core/engine/integrations';

export const PATCH = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId!;
    const pageId = ctx?.params?.id;
    
    if (!pageId) {
      return ApiResponse.error('Page ID is required', 400);
    }

    const { enabled } = await req.json();

    if (typeof enabled !== 'boolean') {
      return ApiResponse.error('Field "enabled" is required and must be boolean', 400);
    }

    const success = await toggleSocialPageSync(tenantId, pageId, enabled);
    
    if (!success) {
      return ApiResponse.error('Social page not found', 404, {}, ErrorCodes.NOT_FOUND);
    }

    return ApiResponse.success({ enabled });
  } catch (error) {
    return ApiResponse.serverError(error, 'integrations.social-page.toggle');
  }
});

