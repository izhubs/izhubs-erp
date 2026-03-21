import { db } from '@/core/engine/db';
import { ApiResponse } from '@/core/engine/response';
import { withPermission, type Claims } from '@/core/engine/rbac';
import { z } from 'zod';

const QuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001';

async function auditLogsHandler(req: Request, claims: Claims) {
  try {
    // Read tenantId directly from JWT claims — reliable even for API routes
    // (middleware doesn't run for /api/* routes so x-tenant-id header is never set)
    const tenantId = claims.tenantId ?? DEFAULT_TENANT;

    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const { entityType, entityId, limit } = parsed.data;

    const conditions = ['a.tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let paramCount = 1;

    if (entityType) {
      paramCount++;
      conditions.push(`a.entity_type = $${paramCount}`);
      params.push(entityType);
    }
    if (entityId) {
      paramCount++;
      conditions.push(`a.entity_id = $${paramCount}`);
      params.push(entityId);
    }

    const { rows } = await db.query(`
      SELECT 
        a.id, a.action, a.entity_type, a.entity_id, a.before, a.after, a.created_at,
        u.name   AS author_name,
        u.avatar_url AS author_avatar
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.created_at DESC
      LIMIT $${paramCount + 1}
    `, [...params, limit]);

    const data = rows.map(r => ({
      id:            r.id,
      action:        r.action,
      entity_type:   r.entity_type,
      entity_id:     r.entity_id,
      before:        r.before  || {},
      after:         r.after   || {},
      created_at:    r.created_at,
      author_name:   r.author_name   || 'System',
      author_avatar: r.author_avatar || null,
    }));

    return ApiResponse.success(data);
  } catch (error) {
    return ApiResponse.serverError(error, 'audit-logs.GET');
  }
}

// Use withPermission to validate JWT and populate claims (including tenantId)
export const GET = withPermission('deals:read', auditLogsHandler);
