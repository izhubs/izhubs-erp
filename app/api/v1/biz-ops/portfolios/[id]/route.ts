import { ApiResponse } from '@/core/engine/response';
import { withModule } from '@/core/engine/rbac';
import { UpdatePortfolioSchema, getPortfolio, updatePortfolio, deletePortfolio } from '@izerp-plugin/modules/biz-ops/engine/portfolios';

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

export const GET = withModule('biz-ops', 'campaigns:read', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const id = req.url.split('/').pop() || ''; // rudimentary way for [id] if params isn't directly passed via next pattern initially, but usually next sends it in 2nd arg
    // Wait, next pattern is async (req, params). withModule is higher order. 
    // claims has params mixed in? No, we will extract ID from URL.
    const parts = req.url.split('/');
    const portfolioId = parts[parts.length - 1];

    const portfolio = await getPortfolio(tenantId, portfolioId);
    if (!portfolio) {
      return ApiResponse.error('Portfolio not found', 404);
    }
    return ApiResponse.success(portfolio);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.portfolios.get');
  }
});

export const PATCH = withModule('biz-ops', 'campaigns:write', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const parts = req.url.split('/');
    const portfolioId = parts[parts.length - 1];

    const portfolio = await getPortfolio(tenantId, portfolioId);
    if (!portfolio) {
      return ApiResponse.error('Portfolio not found', 404);
    }

    const body = await req.json();
    const parsed = UpdatePortfolioSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const updated = await updatePortfolio(tenantId, portfolioId, parsed.data);
    return ApiResponse.success(updated);
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.portfolios.update');
  }
});

export const DELETE = withModule('biz-ops', 'campaigns:write', async (req, claims) => {
  try {
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;
    const parts = req.url.split('/');
    const portfolioId = parts[parts.length - 1];

    const success = await deletePortfolio(tenantId, portfolioId);
    if (!success) {
      return ApiResponse.error('Portfolio not found', 404);
    }
    return ApiResponse.success({ message: 'Deleted successfully' });
  } catch (e) {
    return ApiResponse.serverError(e, 'biz-ops.portfolios.delete');
  }
});
