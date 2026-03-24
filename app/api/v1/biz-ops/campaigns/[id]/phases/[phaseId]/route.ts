import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { UpdateCampaignPhaseSchema, getCampaignPhase, updateCampaignPhase, deleteCampaignPhase } from '@izerp-plugin/modules/biz-ops/engine/campaign_phases';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const parts = req.url.split('/');
    const phaseId = parts[parts.length - 1];
    const campaignId = parts[parts.length - 3];

    const phase = await getCampaignPhase(tenantId, phaseId);
    if (!phase || phase.campaign_id !== campaignId) {
      return ApiResponse.error('Campaign Phase not found', 404);
    }
    return ApiResponse.success(phase);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.phases.get');
  }
});

export const PATCH = withModule('biz-ops', 'campaigns:write', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const parts = req.url.split('/');
    const phaseId = parts[parts.length - 1];
    const campaignId = parts[parts.length - 3];

    const phase = await getCampaignPhase(tenantId, phaseId);
    if (!phase || phase.campaign_id !== campaignId) {
      return ApiResponse.error('Campaign Phase not found', 404);
    }

    const body = await req.json();
    const parsed = UpdateCampaignPhaseSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const updated = await updateCampaignPhase(tenantId, phaseId, parsed.data);
    return ApiResponse.success(updated);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.phases.update');
  }
});

export const DELETE = withModule('biz-ops', 'campaigns:write', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const parts = req.url.split('/');
    const phaseId = parts[parts.length - 1];
    const campaignId = parts[parts.length - 3];

    const phase = await getCampaignPhase(tenantId, phaseId);
    if (!phase || phase.campaign_id !== campaignId) {
      return ApiResponse.error('Campaign Phase not found', 404);
    }

    const success = await deleteCampaignPhase(tenantId, phaseId);
    if (!success) {
      return ApiResponse.error('Campaign Phase not found', 404);
    }
    return ApiResponse.success({ message: 'Deleted successfully' });
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.phases.delete');
  }
});
