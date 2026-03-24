import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { CreatePortfolioSchema, listPortfolios, createPortfolio } from '@izerp-plugin/modules/biz-ops/engine/portfolios';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const portfolios = await listPortfolios(tenantId);
    return ApiResponse.success(portfolios);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.portfolios.list');
  }
});

export const POST = withModule('biz-ops', 'campaigns:write', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const body = await req.json();
    const parsed = CreatePortfolioSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }
    const portfolio = await createPortfolio(tenantId, parsed.data);
    return ApiResponse.success(portfolio, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.portfolios.create');
  }
});
