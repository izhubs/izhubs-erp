/**
 * POST /api/v1/demo-login
 * ============================================================
 * Zero-friction demo login. No email, no password.
 * User picks industry + role → Gets a JWT → Redirects to dashboard.
 *
 * Body: { industry: 'agency', role: 'ceo' }
 * ============================================================
 */

import { z } from 'zod';
import { cookies } from 'next/headers';
import { signJwt } from '@/core/engine/auth/jwt';
import { getDemoSession } from '@/core/engine/demo';
import { ApiResponse } from '@/core/engine/response';
import { INDUSTRY_IDS, ROLE_IDS } from '@/core/types/demo';

const DemoLoginSchema = z.object({
  industry: z.enum(INDUSTRY_IDS),
  role: z.enum(ROLE_IDS),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = DemoLoginSchema.safeParse(body);

    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const { industry, role } = parsed.data;

    // Get or create a demo session for this industry + role
    const { tenantId, userId, email, role: userRole } = await getDemoSession(industry, role);

    // Issue demo tokens — 30m access + 2h refresh so middleware doesn't boot the user
    const basePayload = { sub: userId, email, role: userRole, tenantId };
    const accessToken  = await signJwt({ ...basePayload, type: 'access'  as const }, '30m');
    const refreshToken = await signJwt({ ...basePayload, type: 'refresh' as const }, '2h');

    const jar = await cookies();

    // Access token (readable by JS — needed for apiFetch Authorization header)
    jar.set({
      name: 'hz_access',
      value: accessToken,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30, // 30 minutes
    });

    // Refresh token (httpOnly — used by middleware to keep the session alive)
    jar.set({
      name: 'hz_refresh',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 120, // 2 hours
    });

    return ApiResponse.success({
      accessToken,
      industry,
      role,
      user: { id: userId, email, role: userRole },
    });
  } catch (error) {
    return ApiResponse.serverError(error, 'demo.login');
  }
}
