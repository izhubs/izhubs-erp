import { z } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { hashPassword, signJwt } from '@/core/engine/auth';
import { isEmailTaken, createUser } from '@/core/engine/auth';
import { ApiResponse } from '@/core/engine/response';
import { checkRateLimit } from '@/lib/rate-limiter';

const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 registrations per minute per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rl = await checkRateLimit(`register:${ip}`, 5, 60);
    if (!rl.allowed) return ApiResponse.error('Too many requests. Please wait.', 429);

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const { name, email, password } = parsed.data;

    const taken = await isEmailTaken(email);
    if (taken) {
      return ApiResponse.error('Email already in use', 409);
    }

    const passwordHash = hashPassword(password);
    const user = await createUser({ name, email, passwordHash });

    // Auto-login: set auth cookies so the onboarding page can immediately
    // call POST /api/v1/tenant/provision without getting 401.
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken  = await signJwt({ ...payload, type: 'access' }, '15m');
    const refreshToken = await signJwt({ ...payload, type: 'refresh' }, '7d');

    const cookieOpts = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    cookies().set({ name: 'hz_access',  value: accessToken,  httpOnly: false, maxAge: 60 * 15,           ...cookieOpts });
    cookies().set({ name: 'hz_refresh', value: refreshToken, httpOnly: true,  maxAge: 60 * 60 * 24 * 7,  ...cookieOpts });

    return ApiResponse.success({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, 201);

  } catch (error) {
    return ApiResponse.serverError(error, 'auth.register');
  }
}
