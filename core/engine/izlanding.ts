import { z } from 'zod';
import { db } from './db';
import { TEMPLATES } from './izlanding/templates';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// --- Validation Schemas ---
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  activeDomain: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  templateId: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  activeDomain: z.string().nullable().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// --- Engine Functions ---

/**
 * List all AI Landing Page projects for a tenant
 */
export async function listProjects(tenantId: string = DEFAULT_TENANT_ID): Promise<Project[]> {
  const result = await db.query(
    `SELECT
      id,
      tenant_id AS "tenantId",
      name,
      description,
      active_domain AS "activeDomain",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
     FROM iz_landing_projects
     WHERE tenant_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return result.rows;
}

/**
 * Get a single landing page project by ID
 */
export async function getProject(tenantId: string, projectId: string): Promise<Project | null> {
  const result = await db.query(
    `SELECT
      id,
      tenant_id AS "tenantId",
      name,
      description,
      active_domain AS "activeDomain",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
     FROM iz_landing_projects
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [projectId, tenantId]
  );
  return result.rows[0] || null;
}

/**
 * Create a new AI Landing Page project
 */
export async function createProject(
  tenantId: string = DEFAULT_TENANT_ID,
  data: z.infer<typeof CreateProjectSchema>
): Promise<Project> {
  const result = await db.query(
    `INSERT INTO iz_landing_projects (tenant_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING
      id,
      tenant_id AS "tenantId",
      name,
      description,
      active_domain AS "activeDomain",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"`,
    [tenantId, data.name, data.description || null]
  );
  
  const project = result.rows[0];
  
  // Pre-fill page content from template
  let contentJson = '{}';
  if (data.templateId) {
    const template = TEMPLATES.find(t => t.id === data.templateId);
    if (template) contentJson = JSON.stringify(template.blocks);
  }
  
  await db.query(
    `INSERT INTO iz_landing_pages (project_id, content_json) VALUES ($1, $2::jsonb)`,
    [project.id, contentJson]
  );

  return project;
}

/**
 * Update an existing landing page project
 */
export async function updateProject(
  tenantId: string,
  projectId: string,
  data: z.infer<typeof UpdateProjectSchema>
): Promise<Project | null> {
  const sets: string[] = [];
  const vals: any[] = [];
  let idx = 1;

  if (data.name !== undefined) { sets.push(`name = $${idx++}`); vals.push(data.name); }
  if (data.description !== undefined) { sets.push(`description = $${idx++}`); vals.push(data.description); }
  if (data.status !== undefined) { sets.push(`status = $${idx++}`); vals.push(data.status); }
  if (data.activeDomain !== undefined) { sets.push(`active_domain = $${idx++}`); vals.push(data.activeDomain); }

  if (sets.length === 0) return getProject(tenantId, projectId);

  vals.push(projectId, tenantId);
  const result = await db.query(
    `UPDATE iz_landing_projects
     SET ${sets.join(', ')}
     WHERE id = $${idx++} AND tenant_id = $${idx} AND deleted_at IS NULL
     RETURNING
      id,
      tenant_id AS "tenantId",
      name,
      description,
      active_domain AS "activeDomain",
      status,
      created_at AS "createdAt",
      updated_at AS "updatedAt"`,
    vals
  );
  return result.rows[0] || null;
}

/**
 * Soft-delete a landing page project
 */
export async function deleteProject(tenantId: string, projectId: string): Promise<boolean> {
  const result = await db.query(
    `UPDATE iz_landing_projects
     SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [projectId, tenantId]
  );
  return (result.rowCount ?? 0) > 0;
}

// --- Page Tracking ---

export const PageTrackingSchema = z.object({
  facebookPixelId: z.string().nullable().optional(),
  googleAnalyticsId: z.string().nullable().optional(),
  customHeadScripts: z.string().nullable().optional(),
});

export interface PageTracking {
  id: string;
  projectId: string;
  facebookPixelId: string | null;
  googleAnalyticsId: string | null;
  customHeadScripts: string | null;
}

/**
 * Get or create the default page for a project (each project has 1 page)
 */
export async function getOrCreatePage(projectId: string): Promise<string> {
  const existing = await db.query(
    `SELECT id FROM iz_landing_pages WHERE project_id = $1 LIMIT 1`,
    [projectId]
  );
  if (existing.rows.length > 0) return existing.rows[0].id;

  const created = await db.query(
    `INSERT INTO iz_landing_pages (project_id) VALUES ($1) RETURNING id`,
    [projectId]
  );
  return created.rows[0].id;
}

/**
 * Get page tracking scripts for a project
 */
export async function getPageTracking(projectId: string): Promise<PageTracking | null> {
  const pageId = await getOrCreatePage(projectId);
  const result = await db.query(
    `SELECT
      id,
      project_id AS "projectId",
      tracking_scripts->>'facebookPixelId' AS "facebookPixelId",
      tracking_scripts->>'googleAnalyticsId' AS "googleAnalyticsId",
      tracking_scripts->>'customHeadScripts' AS "customHeadScripts"
     FROM iz_landing_pages
     WHERE id = $1`,
    [pageId]
  );
  return result.rows[0] || null;
}

/**
 * Update page tracking scripts
 */
export async function updatePageTracking(
  projectId: string,
  data: z.infer<typeof PageTrackingSchema>
): Promise<PageTracking | null> {
  const pageId = await getOrCreatePage(projectId);
  const result = await db.query(
    `UPDATE iz_landing_pages
     SET tracking_scripts = jsonb_build_object(
       'facebookPixelId', $2::text,
       'googleAnalyticsId', $3::text,
       'customHeadScripts', $4::text
     )
     WHERE id = $1
     RETURNING
      id,
      project_id AS "projectId",
      tracking_scripts->>'facebookPixelId' AS "facebookPixelId",
      tracking_scripts->>'googleAnalyticsId' AS "googleAnalyticsId",
      tracking_scripts->>'customHeadScripts' AS "customHeadScripts"`,
    [pageId, data.facebookPixelId || null, data.googleAnalyticsId || null, data.customHeadScripts || null]
  );
  return result.rows[0] || null;
}
