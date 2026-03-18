import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { anonymizeUser } from '@/core/engine/gdpr';

// DELETE /api/v1/user/:id — GDPR Right to Erasure
// Only superadmin or the user themselves can trigger this.
export const DELETE = withPermission('users:delete', async (_req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id) return ApiResponse.error('User ID is required', 400);

    const result = await anonymizeUser(id);
    if (!result) return ApiResponse.error('User not found or already anonymized', 404);

    return ApiResponse.success({ userId: result.userId, anonymizedAt: result.anonymizedAt });
  } catch (e) {
    return ApiResponse.serverError(e, 'gdpr.anonymize');
  }
});
