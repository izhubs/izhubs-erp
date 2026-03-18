// =============================================================
// PATCH /api/v1/automations/[id]  — update an automation rule
// DELETE /api/v1/automations/[id] — delete an automation rule
// =============================================================

import { NextResponse } from 'next/server';
import { getAuthClaims, hasPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { updateAutomation, deleteAutomation, UpdateAutomationSchema } from '@/core/engine/automations';

// withPermission HOF uses Record<string, string> for ctx which conflicts
// with Next.js 14 Promise<params>. Use getAuthClaims directly for [id] routes.
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
  const parsed = UpdateAutomationSchema.safeParse(body);
  if (!parsed.success) return ApiResponse.validationError(parsed.error);

  const updated = await updateAutomation(tenantId, id, parsed.data);
  if (!updated) return ApiResponse.error('Automation not found', 404);
  return ApiResponse.success({ automation: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, claims } = await authenticate(req);
  if (error || !claims) return error!;

  const { id } = await params;
  const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
  const deleted = await deleteAutomation(tenantId, id);
  if (!deleted) return ApiResponse.error('Automation not found', 404);
  return ApiResponse.success({ deleted: true });
}
