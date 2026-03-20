import { NextRequest } from 'next/server';
import { db } from '@/core/engine/db';
import { ApiResponse } from '@/core/engine/response';
import { getTenantId } from '@/core/engine/auth/server-context';

import { z } from 'zod';

const QuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantId(); 
    const url = new URL(req.url);
    
    // Zod Validation per backend.mdc Rules
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const { entityType, entityId, limit } = parsed.data;

    // Build dynamic query — filter by tenant_id on audit_log directly
    const conditions = ['a.tenant_id = $1'];
    const params: any[] = [tenantId];
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
        u.name as author_name, u.avatar_url as author_avatar
      FROM audit_log a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.created_at DESC
      LIMIT $${paramCount + 1}
    `, [...params, limit]);

    // Format the response safely
    const formattedRows = rows.map(r => ({
      id: r.id,
      action: r.action,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      before: r.before || {},
      after: r.after || {},
      created_at: r.created_at,
      author_name: r.author_name || 'System Auto',
      author_avatar: r.author_avatar
    }));

    return ApiResponse.success(formattedRows);
  } catch (error) {
    return ApiResponse.serverError(error, 'audit-logs.GET');
  }
}
