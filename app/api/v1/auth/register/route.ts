import { z } from 'zod';
import { NextRequest } from 'next/server';
import { hashPassword } from '@/core/engine/auth';
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

    // Engine layer handles all DB access + Zod parsing
    const taken = await isEmailTaken(email);
    if (taken) {
      return ApiResponse.error('Email already in use', 409);
    }

    const passwordHash = hashPassword(password);
    const user = await createUser({ name, email, passwordHash });

    return ApiResponse.success(user, 201);

  } catch (error) {
    return ApiResponse.serverError(error, 'auth.register');
  }
}
