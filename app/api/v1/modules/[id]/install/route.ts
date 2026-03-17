import { NextResponse } from 'next/server';
import { activateModule, deactivateModule } from '@/core/engine/modules';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/v1/modules/[id]/install
 * Activate a module for the current tenant.
 * Requires: settings:manage permission
 */
export const POST = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const moduleId = ctx?.params?.id;
    if (!moduleId) {
      return ApiResponse.error('Module ID is required', 400, {}, ErrorCodes.VALIDATION_FAILED);
    }

    const tenantId: string = claims.tenantId || DEFAULT_TENANT_ID;

    await activateModule(tenantId, moduleId);

    return ApiResponse.success(
      { moduleId, isActive: true, message: `Module '${moduleId}' activated successfully` },
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('not found in registry')) {
      return ApiResponse.error(message, 404, {}, ErrorCodes.NOT_FOUND);
    }
    return ApiResponse.serverError(err, `POST /api/v1/modules/[id]/install`);
  }
});

/**
 * DELETE /api/v1/modules/[id]/install
 * Deactivate a module for the current tenant.
 * Requires: settings:manage permission
 * Note: Core modules (e.g. 'crm') cannot be deactivated.
 */
export const DELETE = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const moduleId = ctx?.params?.id;
    if (!moduleId) {
      return ApiResponse.error('Module ID is required', 400, {}, ErrorCodes.VALIDATION_FAILED);
    }

    const tenantId: string = claims.tenantId || DEFAULT_TENANT_ID;

    await deactivateModule(tenantId, moduleId);

    return ApiResponse.success({ moduleId, isActive: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Cannot deactivate')) {
      return ApiResponse.error(message, 403, {}, ErrorCodes.FORBIDDEN);
    }
    return ApiResponse.serverError(err, `DELETE /api/v1/modules/[id]/install`);
  }
});

