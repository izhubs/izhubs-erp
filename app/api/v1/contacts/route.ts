import { ContactSchema } from '@/core/schema/entities';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as ContactsEngine from '@/core/engine/contacts';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const GET = withPermission('contacts:read', async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const result = await ContactsEngine.listContacts({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    });
    return ApiResponse.success(result.data, 200, result.meta);
  } catch (e) {
    return ApiResponse.serverError(e, 'contacts.list');
  }
});

export const POST = withPermission('contacts:write', async (req) => {
  try {
    const body = await req.json();
    const parsed = ContactSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const contact = await ContactsEngine.createContact(parsed.data);
    return ApiResponse.success(contact, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'contacts.create');
  }
});
