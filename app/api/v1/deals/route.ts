import { DealSchema } from '@/core/schema/entities';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as DealsEngine from '@/core/engine/deals';

export const GET = withPermission('deals:read', async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const result = await DealsEngine.listDeals({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    });
    return ApiResponse.success(result.data, 200, result.meta);
  } catch (e) {
    return ApiResponse.serverError(e, 'deals.list');
  }
});

export const POST = withPermission('deals:write', async (req) => {
  try {
    const body = await req.json();
    const parsed = DealSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const deal = await DealsEngine.createDeal(parsed.data);
    return ApiResponse.success(deal, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'deals.create');
  }
});
