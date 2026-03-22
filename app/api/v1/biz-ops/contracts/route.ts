// =============================================================
// izhubs ERP — Biz-Ops Contracts API
// GET (list) + POST (create)
// =============================================================

import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as ContractsEngine from '@/modules/biz-ops/engine/contracts';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'contracts:read', async (_req, claims) => {
  const tenantId = claims.tenantId ?? DEFAULT_TENANT;
  const contracts = await ContractsEngine.listContracts(tenantId);
  return ApiResponse.success(contracts);
});

export const POST = withModule('biz-ops', 'contracts:write', async (req, claims) => {
  const tenantId = claims.tenantId ?? DEFAULT_TENANT;
  const body = await req.json();

  const parsed = ContractsEngine.CreateContractSchema.safeParse(body);
  if (!parsed.success) {
    return ApiResponse.validationError(parsed.error);
  }

  const contract = await ContractsEngine.createContract(tenantId, parsed.data);
  return ApiResponse.success(contract, 201);
});
