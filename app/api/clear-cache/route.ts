import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  revalidateTag('nav-config-00000000-0000-0000-0000-000000000001');
  return NextResponse.json({ revalidated: true });
}
