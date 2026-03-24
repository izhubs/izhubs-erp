import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { getProjectContent } from '@/core/engine/izlanding';
import { critiqueLandingPage } from '@/core/engine/izlanding/ai';

export const POST = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const { id } = await ctx!.params;
    
    // Fetch project blocks to critique
    const content = await getProjectContent(id);
    const blocks = content.blocks || [];
    
    const critiqueMarkdown = await critiqueLandingPage(blocks);
    
    return ApiResponse.success({ critique: critiqueMarkdown });
  } catch (err: any) {
    return ApiResponse.serverError(err, 'POST /api/v1/plugins/izlanding/projects/[id]/critique');
  }
});
