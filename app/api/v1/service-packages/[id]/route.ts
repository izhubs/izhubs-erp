// =============================================================
// PATCH  /api/v1/service-packages/[id] — update
// DELETE /api/v1/service-packages/[id] — soft-delete
// =============================================================

import { NextResponse } from 'next/server';
import { getAuthClaims, hasPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { updateServicePackage, deleteServicePackage, UpdateServicePackageSchema } from '@/core/engine/service-packages';

async function authenticate(req: Request) {
  const claims = await getAuthClaims(req);
  if (!claims) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), claims: null };
  if (!hasPermission(claims.role, 'settings:manage')) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), claims: null };
  }
  return { error: null, claims };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, claims } = await authenticate(req);
  if (error || !claims) return error!;

  const { id } = await params;
  const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
  const body = await req.json();
  const parsed = UpdateServicePackageSchema.safeParse(body);
  if (!parsed.success) return ApiResponse.validationError(parsed.error);

  const updated = await updateServicePackage(tenantId, id, parsed.data);
  if (!updated) return ApiResponse.error('Service package not found', 404);
  return ApiResponse.success({ package: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, claims } = await authenticate(req);
  if (error || !claims) return error!;

  const { id } = await params;
  const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
  const deleted = await deleteServicePackage(tenantId, id);
  if (!deleted) return ApiResponse.error('Service package not found', 404);
  return ApiResponse.success({ deleted: true });
}
