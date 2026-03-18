// =============================================================
// GET /api/v1/search
// Global search across contacts + deals using Postgres FTS.
// Falls back to ILIKE if search_vector column not yet populated.
// Returns top 5 of each, debounced by client (200ms).
// =============================================================

import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { db } from '@/core/engine/db';
import { z } from 'zod';

const QuerySchema = z.object({
  q: z.string().min(1).max(100),
});

export const GET = withPermission('contacts:read', async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({ q: searchParams.get('q') ?? '' });
  if (!parsed.success) return ApiResponse.error('Query required', 400);

  const { q } = parsed.data;
  // FTS: prefix match via to_tsquery — "nguye:*" matches "nguyen"
  // immutable_unaccent handles Vietnamese diacritics (ả→a, ê→e, etc.)
  const tsQuery = q.trim().split(/\s+/).map(w => `${w}:*`).join(' & ');

  const [contacts, deals] = await Promise.all([
    db.query(
      // Primary: FTS on search_vector (GIN index, fast)
      // Fallback: ILIKE on name+email in case migration hasn't run yet
      `SELECT id, name, email, title,
              COALESCE(status, 'lead') as status
       FROM contacts
       WHERE deleted_at IS NULL
         AND (
           search_vector @@ to_tsquery('simple', $1)
           OR LOWER(name)  ILIKE $2
           OR LOWER(email) ILIKE $2
         )
       ORDER BY ts_rank_cd(COALESCE(search_vector, ''::tsvector), to_tsquery('simple', $1)) DESC,
                name ASC
       LIMIT 5`,
      [tsQuery, `%${q.toLowerCase()}%`]
    ),
    db.query(
      `SELECT id, name, stage, value
       FROM deals
       WHERE deleted_at IS NULL
         AND (
           search_vector @@ to_tsquery('simple', $1)
           OR LOWER(name) ILIKE $2
         )
       ORDER BY ts_rank_cd(COALESCE(search_vector, ''::tsvector), to_tsquery('simple', $1)) DESC,
                name ASC
       LIMIT 5`,
      [tsQuery, `%${q.toLowerCase()}%`]
    ),
  ]);

  return ApiResponse.success({
    contacts: contacts.rows,
    deals: deals.rows,
  });
});
