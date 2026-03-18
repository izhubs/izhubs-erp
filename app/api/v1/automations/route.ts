// =============================================================
// GET  /api/v1/automations  — list all automations for the tenant
// POST /api/v1/automations  — create a new automation rule
// =============================================================

import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { listAutomations, createAutomation, CreateAutomationSchema } from '@/core/engine/automations';
import type { Claims } from '@/core/engine/auth/jwt';

export const GET = withPermission('settings:manage', async (_req, claims: Claims) => {
  const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
  const automations = await listAutomations(tenantId);
  return ApiResponse.success({ automations });
});

export const POST = withPermission('settings:manage', async (req, claims: Claims) => {
  const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
  const body = await req.json();
  const parsed = CreateAutomationSchema.safeParse(body);
  if (!parsed.success) return ApiResponse.validationError(parsed.error);

  const automation = await createAutomation(tenantId, parsed.data);
  return ApiResponse.success({ automation }, 201);
});
