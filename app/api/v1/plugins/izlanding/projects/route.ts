import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { listProjects, createProject, CreateProjectSchema } from '@/core/engine/izlanding';

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
