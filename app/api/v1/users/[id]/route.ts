import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { updateUser } from '@/core/engine/auth/users';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  role: z.enum(['superadmin', 'admin', 'member', 'viewer']).optional(),
  active: z.boolean().optional(),
});

export const PUT = withPermission('settings:manage', async (req, claims, context: any) => {
  try {
    const params = await context.params;
    const body = await req.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const updated = await updateUser(params.id, claims.tenantId!, parsed.data);
    if (!updated) {
      return ApiResponse.error('User not found in your tenant', 404, undefined, 'NOT_FOUND');
    }

    return ApiResponse.success(updated);
  } catch (error) {
    return ApiResponse.serverError(error, 'users.update');
  }
});
