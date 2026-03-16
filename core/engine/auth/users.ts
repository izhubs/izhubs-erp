import { db } from '@/core/engine/db';
import { z } from 'zod';

// =============================================================
// Auth User Engine
// ONLY layer allowed to query the users table directly.
// Always parses DB output through Zod before returning.
// =============================================================

const UserRowSchema = z.object({
  id: z.string().uuid(),
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
    `SELECT id, name, email, role, active, password_hash
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
