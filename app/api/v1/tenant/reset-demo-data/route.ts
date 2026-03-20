import { ApiResponse } from '../../../../../core/engine/response';
import { deleteDemoTenant } from '../../../../../core/engine/demo';
import { withPermission, type Claims } from '../../../../../core/engine/rbac';
import { getRequestContext } from '../../../../../core/engine/request-context';

async function resetDemoHandler(_req: Request, claims: Claims) {
  try {
    const tenantId = claims.tenantId;
    if (!tenantId) {
      return ApiResponse.error('Tenant ID missing', 400);
    }

    // Delete the entire demo tenant + all cascade data
    // (users, deals, contacts, notes, activities, audit_log)
    await deleteDemoTenant(tenantId);

    return ApiResponse.success({
      message: 'Demo session and all data has been deleted',
      success: true,
    });
  } catch (error) {
    return ApiResponse.serverError(error);
  }
}

// Only demo tenant admins can delete their own tenant
export const DELETE = withPermission('settings:manage', resetDemoHandler);
