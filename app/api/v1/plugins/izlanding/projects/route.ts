import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import { listProjects, createProject, CreateProjectSchema, updateProjectContent, deleteProject } from '@/core/engine/izlanding';
import { generateLandingPageBlocks } from '@/core/engine/izlanding/ai';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/v1/plugins/izlanding/projects
 * List all landing page projects for the tenant.
 */
export const GET = withPermission('settings:manage', async (req, claims) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const projects = await listProjects(tenantId);
    return ApiResponse.success(projects);
  } catch (err) {
    return ApiResponse.serverError(err, 'GET /api/v1/plugins/izlanding/projects');
  }
});

/**
 * POST /api/v1/plugins/izlanding/projects
 * Create a new landing page project.
 */
export const POST = withPermission('settings:manage', async (req, claims) => {
  try {
    const tenantId = claims.tenantId || DEFAULT_TENANT_ID;
    const body = await req.json();
    
    if (body.prompt) {
      // Flow 1: One-Click AI Generate
      const project = await createProject(tenantId, { name: 'AI Generated Landing Page', templateId: 'blank' });
      
      try {
        const blocks = await generateLandingPageBlocks(body.prompt, tenantId);
        await updateProjectContent(project.id, blocks);
        return ApiResponse.success(project, 201);
      } catch (err: any) {
        // Rollback on fail
        await deleteProject(tenantId, project.id);
        return ApiResponse.error(err.message || 'Lỗi sinh AI', 500, {}, ErrorCodes.INTERNAL_ERROR);
      }
    }

    // Flow 2: Standard Manual Create
    const parsed = CreateProjectSchema.safeParse(body);
    
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }
    
    const project = await createProject(tenantId, parsed.data);
    return ApiResponse.success(project, 201);
  } catch (err) {
    return ApiResponse.serverError(err, 'POST /api/v1/plugins/izlanding/projects');
  }
});
