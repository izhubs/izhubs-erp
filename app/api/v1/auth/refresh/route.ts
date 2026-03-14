import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import { verifyJwt, signJwt } from '@/core/engine/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('hz_refresh');
    
    if (!refreshToken || !refreshToken.value) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }
    
    // Verify token
    const decoded = await verifyJwt(refreshToken.value);
    
    if (decoded.type !== 'refresh') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
    }
    
    // Check if user still exists and is active
    const userResult = await db.query('SELECT id, email, role, active FROM users WHERE id = $1', [decoded.sub]);
    const user = userResult.rows[0];
    
    if (!user || !user.active) {
      // Clear cookie immediately
      cookies().delete('hz_refresh');
      return NextResponse.json({ error: 'User no longer valid' }, { status: 401 });
    }
    
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    
    // Issue NEW Access Token
    const accessToken = await signJwt({ ...payload, type: 'access' }, '15m');
    
    // Issue New Refresh Token (Rotation)
    const newRefreshToken = await signJwt({ ...payload, type: 'refresh' }, '7d');
    cookies().set({
      name: 'hz_refresh',
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return NextResponse.json({ 
      data: {
        accessToken,
      } 
    });
    
  } catch (error: any) {
    console.error('Refresh Error:', error);
    // On JWT verification failure, clear the cookie
    cookies().delete('hz_refresh');
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
