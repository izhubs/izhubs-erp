import { DealSchema } from '@/core/schema/entities';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as DealsEngine from '@/modules/crm/engine/deals';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const GET = withPermission('deals:read', async (_req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return ApiResponse.error('Invalid ID format', 400);

    const deal = await DealsEngine.getDeal(id);
    if (!deal) return ApiResponse.error('Deal not found', 404);
    return ApiResponse.success(deal);
  } catch (e) {
    return ApiResponse.serverError(e, 'deals.get');
  }
});

export const PUT = withPermission('deals:write', async (req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return ApiResponse.error('Invalid ID format', 400);

    const body = await req.json();
    const parsed = DealSchema.partial().omit({ id: true, createdAt: true, updatedAt: true }).safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);
    if (Object.keys(parsed.data).length === 0) return ApiResponse.error('No fields to update', 400);

    const deal = await DealsEngine.updateDeal(id, parsed.data);
    if (!deal) return ApiResponse.error('Deal not found', 404);
    return ApiResponse.success(deal);
  } catch (e) {
    return ApiResponse.serverError(e, 'deals.update');
  }
});

export const DELETE = withPermission('deals:delete', async (_req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return ApiResponse.error('Invalid ID format', 400);

    const deletedId = await DealsEngine.softDeleteDeal(id);
    if (!deletedId) return ApiResponse.error('Deal not found', 404);
    return ApiResponse.success({ id: deletedId });
  } catch (e) {
    return ApiResponse.serverError(e, 'deals.delete');
  }
});

// PATCH = partial update (alias for PUT — same logic, semantic HTTP)
export const PATCH = PUT;
