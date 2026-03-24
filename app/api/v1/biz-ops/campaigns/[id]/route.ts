import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as CampaignsEngine from '@izerp-plugin/modules/biz-ops/engine/campaigns';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims, context: any) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const campaign = await CampaignsEngine.getCampaign(tenantId, context.params.id);
    if (!campaign) return ApiResponse.error('Campaign not found', 404, undefined, 'NOT_FOUND');
    return ApiResponse.success(campaign);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.campaigns.get');
  }
});

export const PATCH = withModule('biz-ops', 'campaigns:write', async (req, claims, context: any) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const body = await req.json();
    const parsed = CampaignsEngine.UpdateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const updated = await CampaignsEngine.updateCampaign(tenantId, context.params.id, parsed.data);
    if (!updated) return ApiResponse.error('Campaign not found', 404, undefined, 'NOT_FOUND');
    return ApiResponse.success(updated);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.campaigns.update');
  }
});

export const DELETE = withModule('biz-ops', 'campaigns:delete', async (req, claims, context: any) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const success = await CampaignsEngine.deleteCampaign(tenantId, context.params.id);
    if (!success) return ApiResponse.error('Campaign not found', 404, undefined, 'NOT_FOUND');
    return ApiResponse.success({ success: true });
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.campaigns.delete');
  }
});
