// =============================================================
// izhubs ERP — Biz-Ops Milestones API (nested under contract)
// GET (list by contract) + POST (create)
// =============================================================

import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as MilestonesEngine from '@izerp-plugin/modules/biz-ops/engine/milestones';
import * as ContractsEngine from '@izerp-plugin/modules/biz-ops/engine/contracts';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'contracts:read', async (_req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const contractId = ctx?.params?.id;
    if (!contractId) return ApiResponse.error('Missing contract ID', 400);

    const contract = await ContractsEngine.getContract(tenantId, contractId);
    if (!contract) return ApiResponse.error('Contract not found', 404);

    const milestones = await MilestonesEngine.listMilestones(tenantId, contractId);
    return ApiResponse.success(milestones);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.milestones.list');
  }
});

export const POST = withModule('biz-ops', 'contracts:write', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const contractId = ctx?.params?.id;
    if (!contractId) return ApiResponse.error('Missing contract ID', 400);

    const contract = await ContractsEngine.getContract(tenantId, contractId);
    if (!contract) return ApiResponse.error('Contract not found', 404);

    const body = await req.json();
    const parsed = MilestonesEngine.CreateMilestoneSchema.safeParse({
      ...body,
      contract_id: contractId,
    });
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const milestone = await MilestonesEngine.createMilestone(tenantId, parsed.data);
    return ApiResponse.success(milestone, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.milestones.create');
  }
});
