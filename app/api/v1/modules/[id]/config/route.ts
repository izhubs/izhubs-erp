import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const UpdateConfigSchema = z.object({
  allowedRoles: z.array(z.string()).min(1, 'Lựa chọn ít nhất 1 quyền truy cập').optional(),
});

/**
 * PATCH /api/v1/modules/[id]/config
 * Update the configuration JSONB of a module for the current tenant.
 * Requires: settings:manage permission
 */
export const PATCH = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const moduleId = ctx?.params?.id;
    if (!moduleId) {
      return ApiResponse.error('Module ID is required', 400, {}, ErrorCodes.VALIDATION_FAILED);
    }

    const tenantId: string = claims.tenantId || DEFAULT_TENANT_ID;

    // Verify installation
    const existing = await db.query(
      'SELECT is_active, config FROM tenant_modules WHERE tenant_id = $1 AND module_id = $2',
      [tenantId, moduleId]
    );

    if (existing.rows.length === 0 || !existing.rows[0].is_active) {
       return ApiResponse.error(`Module '${moduleId}' is not installed or active`, 404, {}, ErrorCodes.NOT_FOUND);
    }

    const body = await req.json();
    const parsed = UpdateConfigSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    // Merge new config with existing config
    const currentConfig = existing.rows[0].config || {};
    const newConfig = { ...currentConfig, ...parsed.data };

    await db.query(
      `UPDATE tenant_modules 
       SET config = $1, updated_at = NOW() 
       WHERE tenant_id = $2 AND module_id = $3`,
      [newConfig, tenantId, moduleId]
    );

    // Invalidate cache
    revalidateTag(`nav-config-${tenantId}`);

    return ApiResponse.success({ moduleId, config: newConfig });
  } catch (err) {
    return ApiResponse.serverError(err, `PATCH /api/v1/modules/[id]/config`);
  }
});
