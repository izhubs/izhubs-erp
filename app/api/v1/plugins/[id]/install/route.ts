import { activateModule, deactivateModule } from '@/core/engine/modules';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';

/**
 * POST /api/v1/plugins/[id]/install
 * Activate a plugin for the current tenant.
 * Requires: settings:manage permission
 */
export const POST = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const pluginId = ctx?.params?.id;
    if (!pluginId) {
      return ApiResponse.error('Plugin ID is required', 400, {}, ErrorCodes.VALIDATION_FAILED);
    }

    const tenantId = claims.tenantId;
    if (!tenantId) {
      return ApiResponse.error('Giao dịch bị từ chối: Bắt buộc phải có tenantId', 403, {}, ErrorCodes.FORBIDDEN);
    }

    await activateModule(tenantId, pluginId);

    return ApiResponse.success(
      { pluginId, isActive: true, message: `Plugin '${pluginId}' activated successfully` },
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('not found in registry')) {
      return ApiResponse.error(message, 404, {}, ErrorCodes.NOT_FOUND);
    }
    return ApiResponse.serverError(err, `POST /api/v1/plugins/[id]/install`);
  }
});

/**
 * DELETE /api/v1/plugins/[id]/install
 * Deactivate a plugin for the current tenant.
 * Requires: settings:manage permission
 * Note: Core plugins (e.g. 'crm') cannot be deactivated.
 */
export const DELETE = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const pluginId = ctx?.params?.id;
    if (!pluginId) {
      return ApiResponse.error('Plugin ID is required', 400, {}, ErrorCodes.VALIDATION_FAILED);
    }

    const tenantId = claims.tenantId;
    if (!tenantId) {
       return ApiResponse.error('Giao dịch bị từ chối: Bắt buộc phải có tenantId', 403, {}, ErrorCodes.FORBIDDEN);
    }

    await deactivateModule(tenantId, pluginId);

    return ApiResponse.success({ pluginId, isActive: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Cannot deactivate')) {
      return ApiResponse.error(message, 403, {}, ErrorCodes.FORBIDDEN);
    }
    return ApiResponse.serverError(err, `DELETE /api/v1/plugins/[id]/install`);
  }
});
