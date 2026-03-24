import { z } from 'zod';
import { db } from '../db';

export const SaveBlockSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().default('custom'),
  type: z.string(),
  content: z.record(z.any()),
  isPublic: z.boolean().default(false),
});

export interface LandingBlockTemplate {
  id: string;
  tenantId: string | null;
  name: string;
  category: string;
  type: string;
  content: any;
  isPublic: boolean;
  createdAt: string;
}

export async function saveCustomBlock(tenantId: string, data: z.infer<typeof SaveBlockSchema>): Promise<LandingBlockTemplate> {
  const result = await db.query(
    `INSERT INTO iz_landing_blocks (tenant_id, name, category, type, content, is_public)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     RETURNING 
      id, tenant_id AS "tenantId", name, category, type, content, is_public AS "isPublic", created_at AS "createdAt"`,
    [tenantId, data.name, data.category, data.type, JSON.stringify(data.content), data.isPublic]
  );
  return result.rows[0];
}

export async function getBlockTemplates(tenantId: string): Promise<LandingBlockTemplate[]> {
  const result = await db.query(
    `SELECT 
      id, tenant_id AS "tenantId", name, category, type, content, is_public AS "isPublic", created_at AS "createdAt"
     FROM iz_landing_blocks
     WHERE (tenant_id = $1 OR is_public = true)
     ORDER BY is_public DESC, created_at DESC`,
    [tenantId]
  );
  return result.rows;
}

export async function deleteCustomBlock(tenantId: string, blockId: string): Promise<boolean> {
  const result = await db.query(
    `DELETE FROM iz_landing_blocks WHERE id = $1 AND tenant_id = $2 RETURNING id`,
    [blockId, tenantId]
  );
  return (result.rowCount ?? 0) > 0;
}
