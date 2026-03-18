// =============================================================
// izhubs ERP — PATCH /api/v1/activities/[id]/complete
// Marks an activity as completed. Called by TasksClient optimistically.
// =============================================================

import { ApiResponse } from '@/core/engine/response';
import { withPermission } from '@/core/engine/rbac';
import { completeActivity } from '@/core/engine/activities';

export const PATCH = withPermission('activities:write', async (_req, _claims, ctx) => {
  const { id } = ctx?.params ?? {};
  if (!id) return ApiResponse.error('Missing id', 400);
  await completeActivity(id);
  return ApiResponse.success({ id, completed: true });
});

