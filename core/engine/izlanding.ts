import { z } from 'zod';
import { db } from './db';

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
  return result.rows[0];
}
