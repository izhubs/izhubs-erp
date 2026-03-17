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

    // Issue a short-lived demo JWT (30 minutes)
    const payload = { sub: userId, email, role: userRole, tenantId, type: 'access' as const };
    const accessToken = await signJwt(payload, '30m');

    // Set the access cookie so middleware.ts picks it up
    (await cookies()).set({
      name: 'hz_access',
      value: accessToken,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30, // 30 minutes
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
