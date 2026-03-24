import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { saveCustomBlock, getBlockTemplates, SaveBlockSchema } from '@/core/engine/izlanding/blocks';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/plugins/izlanding/blocks
 * Fetch all available block templates (custom + public)
 */
export const GET = withPermission('settings:manage', async (req, claims) => {
  try {
    const tenantId = claims?.tenantId || DEFAULT_TENANT_ID;
    const blocks = await getBlockTemplates(tenantId);
    return ApiResponse.success(blocks);
  } catch (err: any) {
    return ApiResponse.serverError(err, 'GET /api/v1/plugins/izlanding/blocks');
  }
});

/**
 * POST /api/v1/plugins/izlanding/blocks
 * Save a custom block
 */
export const POST = withPermission('settings:manage', async (req, claims) => {
  try {
    const tenantId = claims?.tenantId || DEFAULT_TENANT_ID;
    const body = await req.json();
    
    // Admin override for creating public system templates
    if (body.isPublic && tenantId !== DEFAULT_TENANT_ID) {
       body.isPublic = false; // Only system tenant can create public blocks
    }

    const data = SaveBlockSchema.parse(body);
    const savedBlock = await saveCustomBlock(tenantId, data);
    
    return ApiResponse.success({ data: savedBlock, message: 'Đã lưu block thành công' }, 201);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return ApiResponse.error('Dữ liệu không hợp lệ', 400, err.errors, ErrorCodes.VALIDATION_FAILED);
    }
    return ApiResponse.serverError(err, 'POST /api/v1/plugins/izlanding/blocks');
  }
});
