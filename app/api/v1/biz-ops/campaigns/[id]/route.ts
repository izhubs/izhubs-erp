// =============================================================
// izhubs ERP — Biz-Ops Campaign [id] API
// GET (by id) + PATCH (update) + DELETE (soft-delete)
// =============================================================

import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as CampaignsEngine from '@/modules/biz-ops/engine/campaigns';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'campaigns:read', async (_req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const id = ctx?.params?.id;
    if (!id) return ApiResponse.error('Missing campaign ID', 400);

    const campaign = await CampaignsEngine.getCampaign(tenantId, id);
    if (!campaign) return ApiResponse.error('Campaign not found', 404);
    return ApiResponse.success(campaign);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.campaigns.get');
  }
});

export const PATCH = withModule('biz-ops', 'campaigns:write', async (req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const id = ctx?.params?.id;
    if (!id) return ApiResponse.error('Missing campaign ID', 400);

    const body = await req.json();
    const parsed = CampaignsEngine.UpdateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const campaign = await CampaignsEngine.updateCampaign(tenantId, id, parsed.data);
    if (!campaign) return ApiResponse.error('Campaign not found', 404);
    return ApiResponse.success(campaign);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.campaigns.update');
  }
});

export const DELETE = withModule('biz-ops', 'campaigns:delete', async (_req, claims, ctx) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const id = ctx?.params?.id;
    if (!id) return ApiResponse.error('Missing campaign ID', 400);

    const deleted = await CampaignsEngine.deleteCampaign(tenantId, id);
    if (!deleted) return ApiResponse.error('Campaign not found', 404);
    return ApiResponse.success({ deleted: true });
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.campaigns.delete');
  }
});
