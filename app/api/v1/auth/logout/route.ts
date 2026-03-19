import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ApiResponse } from '@/core/engine/response';

export async function POST() {
  const jar = await cookies();
  
  jar.delete('hz_access');
  jar.delete('hz_refresh');

  return ApiResponse.success({ message: 'Logged out successfully' });
}
