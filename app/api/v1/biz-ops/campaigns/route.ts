// =============================================================
// izhubs ERP — Biz-Ops Campaigns (Projects) API
// GET (list) + POST (create)
// =============================================================

import { withModule } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as CampaignsEngine from '@izerp-plugin/modules/biz-ops/engine/campaigns';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const url = new URL(req.url);
    const contractId = url.searchParams.get('contract_id');

    const campaigns = contractId
      ? await CampaignsEngine.listCampaignsByContract(tenantId, contractId)
      : await CampaignsEngine.listCampaigns(tenantId);

    return ApiResponse.success(campaigns);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.campaigns.list');
  }
});

export const POST = withModule('biz-ops', 'campaigns:write', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const body = await req.json();

    const parsed = CampaignsEngine.CreateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const campaign = await CampaignsEngine.createCampaign(tenantId, parsed.data);
    return ApiResponse.success(campaign, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.campaigns.create');
  }
});
