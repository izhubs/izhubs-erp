import { db } from '@/core/engine/db';
import { ContactSchema } from '@/core/schema/entities';
import type { Contact } from '@/core/schema/entities';
import { z } from 'zod';

// =============================================================
// Contacts Engine
// ONLY layer allowed to query the contacts table directly.
// Always parses DB output through Zod before returning.
// =============================================================

const COLUMNS = `
  id, name, email, phone, title,
  company_id as "companyId",
  owner_id   as "ownerId",
  custom_fields as "customFields",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

export interface ListOptions {
  page?: number;
  limit?: number;
}

export interface ListResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function listContacts({ page = 1, limit = 50 }: ListOptions = {}): Promise<ListResult<Contact>> {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    db.query(`SELECT ${COLUMNS} FROM contacts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    db.query(`SELECT COUNT(*) FROM contacts WHERE deleted_at IS NULL`),
  ]);
  const total = parseInt(count.rows[0].count);
  return {
    data: rows.rows.map(row => ContactSchema.parse(row)),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getContact(id: string): Promise<Contact | null> {
  const result = await db.query(`SELECT ${COLUMNS} FROM contacts WHERE id = $1 AND deleted_at IS NULL`, [id]);
  if (result.rowCount === 0) return null;
  return ContactSchema.parse(result.rows[0]);
}

export async function createContact(input: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
  const result = await db.query(
    `INSERT INTO contacts (name, email, phone, title, company_id, owner_id, custom_fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${COLUMNS}`,
    [input.name, input.email, input.phone, input.title, input.companyId, input.ownerId, input.customFields ?? {}]
  );
  return ContactSchema.parse(result.rows[0]);
}

export async function updateContact(id: string, input: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(input)) {
    const col = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
    setClauses.push(`${col} = $${idx++}`);
    values.push(value);
  }
  if (setClauses.length === 0) return getContact(id);

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(
    `UPDATE contacts SET ${setClauses.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING ${COLUMNS}`,
    values
  );
  if (result.rowCount === 0) return null;
  return ContactSchema.parse(result.rows[0]);
}

export async function softDeleteContact(id: string): Promise<string | null> {
  const result = await db.query(
    `UPDATE contacts SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  if (result.rowCount === 0) return null;
  return result.rows[0].id as string;
}
