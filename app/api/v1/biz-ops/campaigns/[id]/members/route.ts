import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as MembersEngine from '@/modules/biz-ops/engine/members';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims, context: any) => {
  try {
    const members = await MembersEngine.listMembersByCampaign(context.params.id);
    return ApiResponse.success(members);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.members.list');
  }
});

export const POST = withModule('biz-ops', 'campaigns:write', async (req, claims, context: any) => {
  try {
    const body = await req.json();
    // Merge campaign_id into payload to map safely
    const payload = { campaign_id: context.params.id, ...body };
    const parsed = MembersEngine.AssignMemberSchema.safeParse(payload);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const member = await MembersEngine.assignMember(parsed.data);
    return ApiResponse.success(member, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.members.assign');
  }
});

export const DELETE = withModule('biz-ops', 'campaigns:write', async (req, claims, context: any) => {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    if (!userId) return ApiResponse.error('User ID is required', 400, undefined, 'VALIDATION_FAILED');

    const success = await MembersEngine.removeMember(context.params.id, userId);
    return ApiResponse.success({ success });
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.members.remove');
  }
});
