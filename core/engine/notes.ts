import { db } from '@/core/engine/db';
import { z } from 'zod';

// =============================================================
// Notes Engine
// Polymorphic notes system — attach notes to contacts, deals, companies.
// Sprint 1 — C1 backbone.
// =============================================================

export const NoteSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['contact', 'deal', 'company']),
  entityId: z.string().uuid(),
  authorId: z.string().uuid().optional().nullable(),
  content: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Note = z.infer<typeof NoteSchema>;

const COLUMNS = `
  id,
  entity_type as "entityType",
  entity_id as "entityId",
  author_id as "authorId",
  content,
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

/** List notes for a specific entity */
export async function listNotes(
  entityType: 'contact' | 'deal' | 'company',
  entityId: string
): Promise<Note[]> {
  const result = await db.query(
    `SELECT ${COLUMNS} FROM notes WHERE entity_type = $1 AND entity_id = $2 AND deleted_at IS NULL ORDER BY created_at DESC`,
    [entityType, entityId]
  );
  return result.rows.map(row => NoteSchema.parse(row));
}

/** Create a new note */
export async function createNote(input: {
  entityType: 'contact' | 'deal' | 'company';
  entityId: string;
  authorId?: string;
  content: string;
}): Promise<Note> {
  const result = await db.query(
    `INSERT INTO notes (entity_type, entity_id, author_id, content) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
    [input.entityType, input.entityId, input.authorId ?? null, input.content]
  );
  return NoteSchema.parse(result.rows[0]);
}

/** Soft-delete a note */
export async function deleteNote(id: string): Promise<boolean> {
  const result = await db.query(
    `UPDATE notes SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
