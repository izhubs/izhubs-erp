import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/core/engine/auth';

/**
 * POST /api/v1/auth/view-as
 * Sets or clears the hz_view_as_role cookie for SuperAdmins.
 * Body: { role: 'manager' | 'member' | 'viewer' | null } (null to clear)
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyJwt(token);

    if (decoded.role !== 'superadmin' && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Only admins/superadmins can use view-as' }, { status: 403 });
    }

    const { role } = await req.json();

    const c = await cookies();

    if (role === null) {
      c.delete('hz_view_as_role');
      return NextResponse.json({ message: 'View-As role cleared' });
    }

    const validRoles = ['superadmin', 'admin', 'manager', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    c.set('hz_view_as_role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return NextResponse.json({ message: `Successfully viewing as ${role}`, role });
  } catch (error: any) {
    console.error('View-As API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
