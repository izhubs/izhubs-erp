import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as NotesEngine from '@/core/engine/notes';
import { z } from 'zod';

const CreateNoteSchema = z.object({
  entityType: z.enum(['contact', 'deal', 'company']),
  entityId: z.string().uuid(),
  content: z.string().min(1, 'Note content is required'),
});

// GET /api/v1/notes?entity_type=contact&entity_id=xxx
export const GET = withPermission('contacts:read', async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entity_type') as 'contact' | 'deal' | 'company';
    const entityId = searchParams.get('entity_id');

    if (!entityType || !entityId) {
      return ApiResponse.error('entity_type and entity_id are required', 400);
    }

    const notes = await NotesEngine.listNotes(entityType, entityId);
    return ApiResponse.success(notes);
  } catch (e) {
    return ApiResponse.serverError(e, 'notes.list');
  }
});

// POST /api/v1/notes
export const POST = withPermission('contacts:write', async (req) => {
  try {
    const body = await req.json();
    const parsed = CreateNoteSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const note = await NotesEngine.createNote(parsed.data);
    return ApiResponse.success(note, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'notes.create');
  }
});
