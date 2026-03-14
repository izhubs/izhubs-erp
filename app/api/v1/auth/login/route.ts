import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/core/engine/db';
import { verifyPassword, signJwt } from '@/core/engine/auth';
import { cookies } from 'next/headers';

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    
    const { email, password } = result.data;
    
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    
    if (!user || !user.active) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Issue Tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = await signJwt({ ...payload, type: 'access' }, '15m');
    const refreshToken = await signJwt({ ...payload, type: 'refresh' }, '7d');
    
    // Set Refresh Cookie
    // Using Next.js cookies API
    cookies().set({
      name: 'hz_refresh',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return NextResponse.json({ 
      data: {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      } 
    });
    
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
