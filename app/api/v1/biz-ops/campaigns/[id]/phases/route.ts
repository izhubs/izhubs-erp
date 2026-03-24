import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { CreateCampaignPhaseSchema, listCampaignPhases, createCampaignPhase } from '@izerp-plugin/modules/biz-ops/engine/campaign_phases';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const parts = req.url.split('/');
    // Url usually looks like .../campaigns/[id]/phases
    const campaignId = parts[parts.length - 2]; 

    const phases = await listCampaignPhases(tenantId, campaignId);
    return ApiResponse.success(phases);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.phases.list');
  }
});

export const POST = withModule('biz-ops', 'campaigns:write', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const parts = req.url.split('/');
    const campaignId = parts[parts.length - 2]; 

    const body = await req.json();
    const parsed = CreateCampaignPhaseSchema.safeParse({ ...body, campaign_id: campaignId });
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const phase = await createCampaignPhase(tenantId, parsed.data);
    return ApiResponse.success(phase, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.phases.create');
  }
});
