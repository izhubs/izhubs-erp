import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as NotesEngine from '@/core/engine/notes';

// DELETE /api/v1/notes/[id]
export const DELETE = withPermission('contacts:write', async (_req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id) return ApiResponse.error('Note ID is required', 400);
    const deleted = await NotesEngine.deleteNote(id);
    if (!deleted) return ApiResponse.error('Note not found', 404);
    return ApiResponse.success({ id }, 200);
  } catch (e) {
    return ApiResponse.serverError(e, 'notes.delete');
  }
});
