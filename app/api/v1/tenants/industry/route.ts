import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import { verifyJwt } from '@/core/engine/auth/jwt';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hz_access')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const claims = await verifyJwt(token);
    const tenantId = claims.tenantId ?? '00000000-0000-0000-0000-000000000001';
    
    const { industry } = await req.json();
    if (!industry) return NextResponse.json({ error: 'Industry required' }, { status: 400 });

    await db.query(`UPDATE tenants SET industry = $1, updated_at = NOW() WHERE id = $2`, [industry, tenantId]);
    
    // Invalidate the cache for this tenant's nav config so it updates instantly
    revalidateTag(`nav-config-${tenantId}`);
    
    return NextResponse.json({ success: true, industry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await db.query(`
      SELECT id, name, description, icon, theme_defaults 
      FROM industry_templates 
      ORDER BY name ASC
    `);
    return NextResponse.json({ templates: result.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
