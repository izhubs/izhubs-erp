import { z } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyPassword, signJwt } from '@/core/engine/auth';
import { getUserByEmail } from '@/core/engine/auth';
import { ApiResponse } from '@/core/engine/response';
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limiter';
import { isAnonymized } from '@/core/engine/gdpr';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 login attempts per minute per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rl = await checkRateLimit(`login:${ip}`, 10, 60);
    if (!rl.allowed) {
      return ApiResponse.error('Too many login attempts. Please wait.', 429, {}, 'UNAUTHORIZED');
    }

    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const { email, password } = parsed.data;

    // Engine layer handles all DB access + Zod parsing
    const user = await getUserByEmail(email);

    if (!user || !user.active) {
      return ApiResponse.error('Invalid credentials', 401);
    }

    const isMatch = verifyPassword(password, user.password_hash ?? '');
    if (!isMatch) {
      return ApiResponse.error('Invalid credentials', 401);
    }

    // Block anonymized (GDPR-erased) users
    if (await isAnonymized(user.id)) {
      return ApiResponse.error('Account no longer exists', 401);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await signJwt({ ...payload, type: 'access' }, '15m');
    const refreshToken = await signJwt({ ...payload, type: 'refresh' }, '7d');

    cookies().set({
      name: 'hz_refresh',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Also set hz_access as a short-lived cookie so the browser sends it
    // automatically on all same-origin API requests (no Authorization header needed).
    // httpOnly=false so JS can also read it for non-browser clients.
    cookies().set({
      name: 'hz_access',
      value: accessToken,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 minutes — matches JWT expiry
    });

    return ApiResponse.success({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (error) {
    return ApiResponse.serverError(error, 'auth.login');
  }
}
