import { db } from '@/core/engine/db';
import { z } from 'zod';

// =============================================================
// Auth User Engine
// ONLY layer allowed to query the users table directly.
// Always parses DB output through Zod before returning.
// =============================================================

const UserRowSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().optional(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['superadmin', 'admin', 'member', 'viewer']),
  active: z.boolean(),
  password_hash: z.string().optional(),
});

const PublicUserSchema = UserRowSchema.omit({ password_hash: true });
export type PublicUser = z.infer<typeof PublicUserSchema>;

// For internal auth use only — includes password_hash
type UserWithHash = z.infer<typeof UserRowSchema>;

export async function getUserByEmail(email: string): Promise<UserWithHash | null> {
  const result = await db.query(
    `SELECT id, tenant_id, name, email, role, active, password_hash
     FROM users WHERE email = $1`,
    [email]
  );
  if (!result.rowCount || result.rowCount === 0) return null;
  return UserRowSchema.parse(result.rows[0]);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const result = await db.query(
    `SELECT id, name, email, role, active
     FROM users WHERE id = $1`,
    [id]
  );
  if (!result.rowCount || result.rowCount === 0) return null;
  return PublicUserSchema.parse(result.rows[0]);
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const result = await db.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );
  return (result.rowCount ?? 0) > 0;
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: 'superadmin' | 'admin' | 'member' | 'viewer';
}

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const role = input.role ?? 'member';
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, active`,
    [input.name, input.email, input.passwordHash, role]
  );
  return PublicUserSchema.parse(result.rows[0]);
}

export async function listUsers(tenantId?: string): Promise<PublicUser[]> {
  const query = tenantId 
    ? `SELECT id, name, email, role, active FROM users WHERE tenant_id = $1 ORDER BY active DESC, name ASC`
    : `SELECT id, name, email, role, active FROM users ORDER BY active DESC, name ASC`;
  
  const result = await db.query(query, tenantId ? [tenantId] : []);
  return result.rows.map(r => PublicUserSchema.parse({...r, tenant_id: tenantId}));
}

export async function updateUser(
  id: string,
  tenantId: string,
  updates: { role?: 'superadmin' | 'admin' | 'member' | 'viewer'; active?: boolean }
): Promise<PublicUser | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (updates.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(updates.role);
  }
  if (updates.active !== undefined) {
    fields.push(`active = $${idx++}`);
    values.push(updates.active);
  }

  if (fields.length === 0) return getUserById(id);

  values.push(id, tenantId);
  const result = await db.query(
    `UPDATE users SET ${fields.join(', ')}
     WHERE id = $${idx++} AND tenant_id = $${idx++}
     RETURNING id, name, email, role, active`,
    values
  );

  if (!result.rowCount || result.rowCount === 0) return null;
  return PublicUserSchema.parse(result.rows[0]);
}

