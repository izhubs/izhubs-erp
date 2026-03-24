import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as MembersEngine from '@izerp-plugin/modules/biz-ops/engine/members';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims, context: any) => {
  try {
    const params = await context.params;
    const members = await MembersEngine.listMembersByCampaign(params.id);
    return ApiResponse.success(members);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.members.list');
  }
});

export const POST = withModule('biz-ops', 'campaigns:write', async (req, claims, context: any) => {
  try {
    const body = await req.json();
    const params = await context.params;
    // Merge campaign_id into payload to map safely
    const payload = { campaign_id: params.id, ...body };
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
    const params = await context.params;
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    if (!userId) return ApiResponse.error('User ID is required', 400, undefined, 'VALIDATION_FAILED');

    const success = await MembersEngine.removeMember(params.id, userId);
    return ApiResponse.success({ success });
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.members.remove');
  }
});
