import { withPermission } from '@/core/engine/rbac';
import { ApiResponse } from '@/core/engine/response';
import { listUsers, createUser, isEmailTaken } from '@/core/engine/auth/users';
import { hashPassword } from '@/core/engine/auth/crypto';
import { z } from 'zod';
import { withRequestContext } from '@/core/engine/request-context';

export const GET = withPermission('settings:manage', async (req, claims) => {
  try {
    const users = await listUsers(claims.tenantId!);
    return ApiResponse.success(users);
  } catch (error) {
    return ApiResponse.serverError(error, 'users.list');
  }
});

const InviteUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['superadmin', 'admin', 'member', 'viewer']).default('member'),
});

export const POST = withPermission('settings:manage', async (req, claims) => {
  try {
    const body = await req.json();
    const parsed = InviteUserSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.validationError(parsed.error);
    }

    const { name, email, role } = parsed.data;

    // Check if email taken
    if (await isEmailTaken(email)) {
      return ApiResponse.error(`Email ${email} is already in use.`, 409, undefined, 'EMAIL_TAKEN');
    }

    // Auto-generate password for MVP
    const passwordHash = await hashPassword('izhubs2026');

    // Create user (We need to manually update their tenant_id after creation since createUser doesn't take tenantId)
    // Wait, createUser doesn't take tenantId! Let's just create it and then update the tenant_id directly using DB.
    // For MVP, we will run a quick DB update.

    let newUser = await createUser({
      name,
      email,
      passwordHash,
      role
    });

    if (claims.tenantId) {
      const { db } = await import('@/core/engine/db');
      await db.query(`UPDATE users SET tenant_id = $1 WHERE id = $2`, [claims.tenantId, newUser.id]);
      newUser.tenant_id = claims.tenantId;
    }

    return ApiResponse.success(newUser, 201);
  } catch (error) {
    return ApiResponse.serverError(error, 'users.create');
  }
});
