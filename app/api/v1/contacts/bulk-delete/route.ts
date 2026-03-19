import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as ContactsEngine from '@/modules/crm/engine/contacts';
import { z } from 'zod';

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()),
});

export const POST = withPermission('contacts:delete', async (req, _claims) => {
  try {
    const body = await req.json();
    const parsed = bulkDeleteSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    if (parsed.data.ids.length === 0) {
      return ApiResponse.error('No IDs provided', 400);
    }

    const deletedIds = await ContactsEngine.bulkDeleteContacts(parsed.data.ids);
    
    return ApiResponse.success({
      deletedCount: deletedIds.length,
      deletedIds
    });
  } catch (e) {
    return ApiResponse.serverError(e, 'contacts.bulkDelete');
  }
});
