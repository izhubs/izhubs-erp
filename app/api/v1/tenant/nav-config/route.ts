// GET /api/v1/tenant/nav-config
// Returns the filtered NavConfig for the authenticated user's tenant.
// Used by client components that need to reactively read nav state.
// Server Components should call lib/nav-config.ts directly instead.

import { NextResponse } from 'next/server';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { getNavConfig } from '@/lib/nav-config';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { sub: string; tenantId: string; role: string };
  try {
    payload = await verifyJwt(authHeader.slice(7)) as typeof payload;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const navConfig = await getNavConfig(payload.tenantId, payload.role);

  if (!navConfig) {
    // Tenant has no industry set — return a minimal default config
    return NextResponse.json({ navConfig: null }, { status: 200 });
  }

  return NextResponse.json({ navConfig }, { status: 200 });
}
