import { db } from '@/core/engine/db';
import { DealSchema } from '@/core/schema/entities';
import type { Deal } from '@/core/schema/entities';

// =============================================================
// Deals Engine
// ONLY layer allowed to query the deals table directly.
// Always parses DB output through Zod before returning.
// =============================================================

const COLUMNS = `
  id, name, value, stage,
  contact_id as "contactId",
  company_id as "companyId",
  owner_id   as "ownerId",
  closed_at  as "closedAt",
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

export async function listDeals({ page = 1, limit = 50 }: ListOptions = {}): Promise<ListResult<Deal>> {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    db.query(`SELECT ${COLUMNS} FROM deals WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    db.query(`SELECT COUNT(*) FROM deals WHERE deleted_at IS NULL`),
  ]);
  const total = parseInt(count.rows[0].count);
  return {
    data: rows.rows.map(row => DealSchema.parse(row)),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getDeal(id: string): Promise<Deal | null> {
  const result = await db.query(`SELECT ${COLUMNS} FROM deals WHERE id = $1 AND deleted_at IS NULL`, [id]);
  if (result.rowCount === 0) return null;
  return DealSchema.parse(result.rows[0]);
}

export async function createDeal(input: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
  const result = await db.query(
    `INSERT INTO deals (name, value, stage, contact_id, company_id, owner_id, closed_at, custom_fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${COLUMNS}`,
    [input.name, input.value, input.stage, input.contactId, input.companyId, input.ownerId, input.closedAt, input.customFields ?? {}]
  );
  return DealSchema.parse(result.rows[0]);
}

export async function updateDeal(id: string, input: Partial<Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Deal | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(input)) {
    const col = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
    setClauses.push(`${col} = $${idx++}`);
    values.push(value);
  }
  if (setClauses.length === 0) return getDeal(id);

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(
    `UPDATE deals SET ${setClauses.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING ${COLUMNS}`,
    values
  );
  if (result.rowCount === 0) return null;
  return DealSchema.parse(result.rows[0]);
}

export async function softDeleteDeal(id: string): Promise<string | null> {
  const result = await db.query(
    `UPDATE deals SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  if (result.rowCount === 0) return null;
  return result.rows[0].id as string;
}
