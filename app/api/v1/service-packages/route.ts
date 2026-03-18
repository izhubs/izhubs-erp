// =============================================================
// GET  /api/v1/service-packages       — list
// POST /api/v1/service-packages       — create
// =============================================================

import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import {
  listServicePackages,
  createServicePackage,
  getPackageSubscriberCounts,
  CreateServicePackageSchema,
} from '@/core/engine/service-packages';
import type { Claims } from '@/core/engine/auth/jwt';

export const GET = withPermission('settings:manage', async (_req, claims: Claims) => {
  const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
  const [packages, subscriberCounts] = await Promise.all([
    listServicePackages(tenantId),
    getPackageSubscriberCounts(tenantId),
  ]);
  const result = packages.map(p => ({ ...p, subscriber_count: subscriberCounts[p.id] ?? 0 }));
  return ApiResponse.success({ packages: result });
});

export const POST = withPermission('settings:manage', async (req, claims: Claims) => {
  const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
  const body = await req.json();
  const parsed = CreateServicePackageSchema.safeParse(body);
  if (!parsed.success) return ApiResponse.validationError(parsed.error);
  const pkg = await createServicePackage(tenantId, parsed.data);
  return ApiResponse.success({ package: pkg }, 201);
});
