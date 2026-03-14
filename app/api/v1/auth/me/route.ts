import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import { verifyJwt } from '@/core/engine/auth';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = await verifyJwt(token);
    
    if (decoded.type !== 'access') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
    }
    
    const userResult = await db.query(
      'SELECT id, name, email, role, avatar_url, active, created_at FROM users WHERE id = $1',
      [decoded.sub]
    );
    
    const user = userResult.rows[0];
    
    if (!user || !user.active) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
    }
    
    return NextResponse.json({ data: user });
    
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    console.error('Me endpoint error:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
