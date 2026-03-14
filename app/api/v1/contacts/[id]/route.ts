import { ContactSchema } from '@/core/schema/entities';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import * as ContactsEngine from '@/core/engine/contacts';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const GET = withPermission('contacts:read', async (_req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return ApiResponse.error('Invalid ID format', 400);

    const contact = await ContactsEngine.getContact(id);
    if (!contact) return ApiResponse.error('Contact not found', 404);
    return ApiResponse.success(contact);
  } catch (e) {
    return ApiResponse.serverError(e, 'contacts.get');
  }
});

export const PUT = withPermission('contacts:write', async (req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return ApiResponse.error('Invalid ID format', 400);

    const body = await req.json();
    const parsed = ContactSchema.partial().omit({ id: true, createdAt: true, updatedAt: true }).safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);
    if (Object.keys(parsed.data).length === 0) return ApiResponse.error('No fields to update', 400);

    const contact = await ContactsEngine.updateContact(id, parsed.data);
    if (!contact) return ApiResponse.error('Contact not found', 404);
    return ApiResponse.success(contact);
  } catch (e) {
    return ApiResponse.serverError(e, 'contacts.update');
  }
});

export const DELETE = withPermission('contacts:delete', async (_req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return ApiResponse.error('Invalid ID format', 400);

    const deletedId = await ContactsEngine.softDeleteContact(id);
    if (!deletedId) return ApiResponse.error('Contact not found', 404);
    return ApiResponse.success({ id: deletedId });
  } catch (e) {
    return ApiResponse.serverError(e, 'contacts.delete');
  }
});
