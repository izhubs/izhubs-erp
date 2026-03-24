import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { cloneWebsiteToBlocks } from '@/core/engine/izlanding/ai';

export const POST = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const { id } = await ctx!.params;
    const { url } = await req.json();
    
    if (!url) {
      return ApiResponse.error('Cần cung cấp URL trang web để Clone', 400);
    }
    
    const blocks = await cloneWebsiteToBlocks(url);
    
    return ApiResponse.success({ blocks }, 200);
  } catch (err: any) {
    return ApiResponse.serverError(err, 'POST /api/v1/plugins/izlanding/projects/[id]/clone');
  }
});
