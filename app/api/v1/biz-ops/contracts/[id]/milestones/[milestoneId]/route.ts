// =============================================================
// izhubs ERP — Biz-Ops Milestone [milestoneId] API
// GET (by id) + PATCH (update) + DELETE (soft-delete)
// =============================================================

import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as MilestonesEngine from '@/modules/biz-ops/engine/milestones';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'contracts:read', async (_req, claims, ctx) => {
  const tenantId = claims.tenantId ?? DEFAULT_TENANT;
  const milestoneId = ctx?.params?.milestoneId;
  if (!milestoneId) return ApiResponse.error('Missing milestone ID', 400);

  const milestone = await MilestonesEngine.getMilestone(tenantId, milestoneId);
  if (!milestone) return ApiResponse.error('Milestone not found', 404);
  return ApiResponse.success(milestone);
});

export const PATCH = withModule('biz-ops', 'contracts:write', async (req, claims, ctx) => {
  const tenantId = claims.tenantId ?? DEFAULT_TENANT;
  const milestoneId = ctx?.params?.milestoneId;
  if (!milestoneId) return ApiResponse.error('Missing milestone ID', 400);

  const body = await req.json();
  const parsed = MilestonesEngine.UpdateMilestoneSchema.safeParse(body);
  if (!parsed.success) {
    return ApiResponse.validationError(parsed.error);
  }

  const milestone = await MilestonesEngine.updateMilestone(tenantId, milestoneId, parsed.data);
  if (!milestone) return ApiResponse.error('Milestone not found', 404);
  return ApiResponse.success(milestone);
});

export const DELETE = withModule('biz-ops', 'contracts:delete', async (_req, claims, ctx) => {
  const tenantId = claims.tenantId ?? DEFAULT_TENANT;
  const milestoneId = ctx?.params?.milestoneId;
  if (!milestoneId) return ApiResponse.error('Missing milestone ID', 400);

  const deleted = await MilestonesEngine.deleteMilestone(tenantId, milestoneId);
  if (!deleted) return ApiResponse.error('Milestone not found', 404);
  return ApiResponse.success({ deleted: true });
});
