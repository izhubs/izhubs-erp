import { NextResponse } from 'next/server';
import { getTenantModules } from '@/core/engine/modules';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/modules
 * List all available modules with their activation status for the current tenant.
 * Requires: settings:manage permission
 */
export const GET = withPermission('settings:manage', async (req, claims) => {
  try {
    const tenantId: string = claims.tenantId || DEFAULT_TENANT_ID;
    const modules = await getTenantModules(tenantId);
    return ApiResponse.success(modules);
  } catch (err) {
    return ApiResponse.serverError(err, 'GET /api/v1/modules');
  }
});

