import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import * as CFEngine from '@/core/engine/custom-fields';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const GET = withPermission('settings:manage', async (_req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return ApiResponse.error('Invalid ID', 400);
    const field = await CFEngine.getCustomField(id);
    if (!field) return ApiResponse.error('Not found', 404, undefined, ErrorCodes.NOT_FOUND);
    return ApiResponse.success(field);
  } catch (e) {
    return ApiResponse.serverError(e, 'custom-fields.get');
  }
});

export const DELETE = withPermission('settings:manage', async (_req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return ApiResponse.error('Invalid ID', 400);
    const deletedId = await CFEngine.deleteCustomField(id);
    if (!deletedId) return ApiResponse.error('Not found', 404, undefined, ErrorCodes.NOT_FOUND);
    return ApiResponse.success({ id: deletedId });
  } catch (e) {
    return ApiResponse.serverError(e, 'custom-fields.delete');
  }
});
