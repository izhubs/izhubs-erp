import { NextResponse } from 'next/server';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { getProjectContent, updateProjectContent } from '@/core/engine/izlanding';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/plugins/izlanding/projects/[id]/content
 */
export const GET = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const projectId = ctx?.params?.id;
    if (!projectId) return ApiResponse.error('Project ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const content = await getProjectContent(projectId);
    return ApiResponse.success(content);
  } catch (err) {
    return ApiResponse.serverError(err, 'GET /api/v1/plugins/izlanding/projects/[id]/content');
  }
});

/**
 * PUT /api/v1/plugins/izlanding/projects/[id]/content
 */
export const PUT = withPermission('settings:manage', async (req, claims, ctx) => {
  try {
    const projectId = ctx?.params?.id;
    if (!projectId) return ApiResponse.error('Project ID required', 400, {}, ErrorCodes.VALIDATION_FAILED);

    const body = await req.json();
    if (!Array.isArray(body.blocks)) {
      return ApiResponse.error('Blocks must be an array', 400, {}, ErrorCodes.VALIDATION_FAILED);
    }

    const ok = await updateProjectContent(projectId, { 
      blocks: body.blocks, 
      seoSettings: body.seoSettings 
    });
    if (!ok) return ApiResponse.error('Failed to update content', 500);

    return ApiResponse.success({ success: true });
  } catch (err) {
    return ApiResponse.serverError(err, 'PUT /api/v1/plugins/izlanding/projects/[id]/content');
  }
});
