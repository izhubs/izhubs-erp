import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { removeMember } from '@izerp-plugin/modules/biz-ops/engine/members';

export const DELETE = withModule('biz-ops', 'campaigns:delete', async (req, claims, ctx) => {
  const params = ctx?.params as { id: string; userId: string };
  try {
    const success = await removeMember(params.id, params.userId);
    if (!success) return ApiResponse.error('Member not found in campaign', 404);
    return ApiResponse.success({ message: 'Removed successfully' });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});
