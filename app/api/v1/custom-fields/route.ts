import { CustomFieldDefinitionSchema } from '@/core/schema/entities';
import { withPermission } from '@/core/engine/rbac';
import { ApiResponse, ErrorCodes } from '@/core/engine/response';
import * as CFEngine from '@/core/engine/custom-fields';

const CreateSchema = CustomFieldDefinitionSchema.omit({ id: true, createdAt: true });

export const GET = withPermission('settings:manage', async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType') as any;
    const fields = await CFEngine.listCustomFields(entityType || undefined);
    return ApiResponse.success(fields);
  } catch (e) {
    return ApiResponse.serverError(e, 'custom-fields.list');
  }
});

export const POST = withPermission('settings:manage', async (req) => {
  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) return ApiResponse.validationError(parsed.error);

    const taken = await CFEngine.isKeyTaken(parsed.data.entityType, parsed.data.key);
    if (taken) return ApiResponse.error(
      `Key "${parsed.data.key}" already exists for ${parsed.data.entityType}`,
      409,
      undefined,
      ErrorCodes.CONFLICT
    );

    const field = await CFEngine.createCustomField(parsed.data);
    return ApiResponse.success(field, 201);
  } catch (e) {
    return ApiResponse.serverError(e, 'custom-fields.create');
  }
});
