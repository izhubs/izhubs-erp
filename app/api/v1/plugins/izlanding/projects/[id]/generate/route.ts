import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { generateLandingPageBlocks } from '@/core/engine/izlanding/ai';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/v1/plugins/izlanding/projects/[id]/generate
 * Generate Vibe Code using Gemini APIs based on User Prompt.
 */
export const POST = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const projectId = ctx?.params?.id;
    if (!projectId) return ApiResponse.error('Project ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const body = await req.json();
    const { prompt, customApiKey, existingBlocks } = body;
    
    if (!prompt) {
      return ApiResponse.error('Prompt is required', 400, {}, ErrorCodes.VALIDATION_FAILED);
    }

    // Call the Engine to generate
    const blocks = await generateLandingPageBlocks(prompt, claims?.tenantId || DEFAULT_TENANT_ID, customApiKey || undefined, existingBlocks);

    // Dữ liệu chỉ được trả về Frontend để Preview thay vì lưu ngay xuống DB
    // Frontend (EditProjectForm) sẽ gọi lệnh PUT /content để cập nhật khi người dùng vừa ý.
    return ApiResponse.success({ blocks });
  } catch (err: any) {
    return ApiResponse.serverError(err, 'POST /api/v1/plugins/izlanding/projects/[id]/generate');
  }
});
