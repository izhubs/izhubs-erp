import { NextResponse } from 'next/server';
import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { listMembersByCampaign, assignMember, AssignMemberSchema } from '@/modules/biz-ops/engine/members';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims, ctx) => {
  const params = ctx?.params as { id: string };
  try {
    const members = await listMembersByCampaign(params.id);
    return ApiResponse.success(members);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const POST = withModule('biz-ops', 'campaigns:write', async (req, claims, ctx) => {
  const params = ctx?.params as { id: string };
  try {
    const body = await req.json();
    const parsed = AssignMemberSchema.safeParse({ ...body, campaign_id: params.id });
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const member = await assignMember(parsed.data);
    return ApiResponse.success(member);
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

export const DELETE = withModule('biz-ops', 'campaigns:write', async (req, claims, ctx) => {
  const params = ctx?.params as { id: string };
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return ApiResponse.error('Missing userId query parameter', 400);
  }

  try {
    const { removeMember } = await import('@/modules/biz-ops/engine/members');
    const success = await removeMember(params.id, userId);
    if (!success) return ApiResponse.error('Member not found', 404);
    
    return ApiResponse.success({ deleted: true });
  } catch (err: any) {
    return ApiResponse.serverError(err);
  }
});

