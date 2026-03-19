import { db } from '@/core/engine/db';
import { ContactSchema } from '@/core/schema/entities';
import type { Contact } from '@/core/schema/entities';
import { z } from 'zod';
import { eventBus } from '@/core/engine/event-bus';

// =============================================================
// Contacts Engine
// ONLY layer allowed to query the contacts table directly.
// Always parses DB output through Zod before returning.
// =============================================================

const COLUMNS = `
  id, name, email, phone, title, status,
  company_id as "companyId",
  owner_id   as "ownerId",
  custom_fields as "customFields",
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

export interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function listContacts({ page = 1, limit = 50, search, status, sortBy = 'created_at', sortOrder = 'desc' }: ListOptions = {}): Promise<ListResult<Contact>> {
  const offset = (page - 1) * limit;
  const conditions: string[] = ['deleted_at IS NULL'];
  const values: unknown[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx} OR title ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (status && status !== 'all') {
    conditions.push(`status = $${idx}`);
    values.push(status);
    idx++;
  }

  const where = conditions.join(' AND ');
  // Whitelist allowed sort columns to prevent injection
  const allowedSorts: Record<string, string> = { name: 'name', email: 'email', created_at: 'created_at', updated_at: 'updated_at', status: 'status' };
  const sortCol = allowedSorts[sortBy] ?? 'created_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const [rows, count] = await Promise.all([
    db.query(`SELECT ${COLUMNS} FROM contacts WHERE ${where} ORDER BY ${sortCol} ${order} LIMIT $${idx} OFFSET $${idx + 1}`, [...values, limit, offset]),
    db.query(`SELECT COUNT(*) FROM contacts WHERE ${where}`, values),
  ]);
  const total = parseInt(count.rows[0].count);
  return {
    data: rows.rows.map(row => ContactSchema.parse(row)),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

/** Get counts per status for tab badges */
export async function countByStatus(): Promise<Record<string, number>> {
  const result = await db.query(
    `SELECT COALESCE(status, 'lead') AS status, COUNT(*)::int AS count FROM contacts WHERE deleted_at IS NULL GROUP BY status`
  );
  const counts: Record<string, number> = { all: 0 };
  for (const row of result.rows) {
    counts[row.status] = row.count;
    counts.all += row.count;
  }
  return counts;
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
  const contact = ContactSchema.parse(result.rows[0]);
  await eventBus.emit('contact.created', { contact });
  return contact;
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
  const contact = ContactSchema.parse(result.rows[0]);
  await eventBus.emit('contact.updated', { contact, changes: input });
  return contact;
}

export async function softDeleteContact(id: string): Promise<string | null> {
  const result = await db.query(
    `UPDATE contacts SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  if (result.rowCount === 0) return null;
  const contactId = result.rows[0].id as string;
  await eventBus.emit('contact.deleted', { contactId });
  return contactId;
}

export async function bulkDeleteContacts(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  const result = await db.query(
    `UPDATE contacts SET deleted_at = NOW(), updated_at = NOW() WHERE id IN (${placeholders}) AND deleted_at IS NULL RETURNING id`,
    ids
  );
  const deletedIds = result.rows.map(r => r.id as string);
  // Emitting individual events for consistency
  for (const id of deletedIds) {
    await eventBus.emit('contact.deleted', { contactId: id });
  }
  return deletedIds;
}
