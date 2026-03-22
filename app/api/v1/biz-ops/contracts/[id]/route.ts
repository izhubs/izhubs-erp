// =============================================================
// izhubs ERP — Biz-Ops Contract [id] API
// GET (by id) + PATCH (update) + DELETE (soft-delete)
// =============================================================

import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as ContractsEngine from '@/modules/biz-ops/engine/contracts';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'contracts:read', async (_req, claims, ctx) => {
  const tenantId = claims.tenantId ?? DEFAULT_TENANT;
  const id = ctx?.params?.id;
  if (!id) return ApiResponse.error('Missing contract ID', 400);

  const contract = await ContractsEngine.getContract(tenantId, id);
  if (!contract) return ApiResponse.error('Contract not found', 404);
  return ApiResponse.success(contract);
});

export const PATCH = withModule('biz-ops', 'contracts:write', async (req, claims, ctx) => {
  const tenantId = claims.tenantId ?? DEFAULT_TENANT;
  const id = ctx?.params?.id;
  if (!id) return ApiResponse.error('Missing contract ID', 400);

  const body = await req.json();
  const parsed = ContractsEngine.UpdateContractSchema.safeParse(body);
  if (!parsed.success) {
    return ApiResponse.validationError(parsed.error);
  }

  const contract = await ContractsEngine.updateContract(tenantId, id, parsed.data);
  if (!contract) return ApiResponse.error('Contract not found', 404);
  return ApiResponse.success(contract);
});

export const DELETE = withModule('biz-ops', 'contracts:delete', async (_req, claims, ctx) => {
  const tenantId = claims.tenantId ?? DEFAULT_TENANT;
  const id = ctx?.params?.id;
  if (!id) return ApiResponse.error('Missing contract ID', 400);

  const deleted = await ContractsEngine.deleteContract(tenantId, id);
  if (!deleted) return ApiResponse.error('Contract not found', 404);
  return ApiResponse.success({ deleted: true });
});
