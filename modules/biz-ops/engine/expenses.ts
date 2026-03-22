// =============================================================
// izhubs ERP — Expenses Engine
// CRUD + Zod validation for expense_records table.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';

export const ExpenseSchema = z.object({
  id:          z.string().uuid(),
  tenant_id:   z.string().uuid(),
  campaign_id: z.string().uuid(),
  amount:      z.coerce.number(),
  date:        z.coerce.date(),
  category:    z.string(),
  status:      z.enum(['pending', 'paid']),
  receipt_url: z.string().nullable(),
  notes:       z.string().nullable(),
  deleted_at:  z.coerce.date().nullable(),
  created_at:  z.coerce.date(),
  updated_at:  z.coerce.date(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

export const CreateExpenseSchema = z.object({
  campaign_id: z.string().uuid(),
  amount:      z.number().min(0),
  date:        z.string().optional(),
  category:    z.string().max(50).default('general'),
  status:      z.enum(['pending', 'paid']).default('pending'),
  receipt_url: z.string().optional(),
  notes:       z.string().optional(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.omit({ campaign_id: true }).partial();

export async function listExpensesByCampaign(tenantId: string, campaignId: string): Promise<Expense[]> {
  const res = await db.query(
    `SELECT * FROM expense_records
     WHERE tenant_id = $1 AND campaign_id = $2 AND deleted_at IS NULL
     ORDER BY date DESC, created_at DESC`,
    [tenantId, campaignId]
  );
  return res.rows.map(r => ExpenseSchema.parse(r));
}

export async function getExpense(tenantId: string, id: string): Promise<Expense | null> {
  const res = await db.query(
    `SELECT * FROM expense_records WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return ExpenseSchema.parse(res.rows[0]);
}

export async function createExpense(
  tenantId: string,
  data: z.infer<typeof CreateExpenseSchema>
): Promise<Expense> {
  const res = await db.query(
    `INSERT INTO expense_records
       (tenant_id, campaign_id, amount, date, category, status, receipt_url, notes)
     VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7, $8)
     RETURNING *`,
    [
      tenantId, data.campaign_id, data.amount,
      data.date || null, data.category, data.status,
      data.receipt_url || null, data.notes || null,
    ]
  );
  return ExpenseSchema.parse(res.rows[0]);
}

export async function updateExpense(
  tenantId: string,
  id: string,
  data: z.infer<typeof UpdateExpenseSchema>
): Promise<Expense | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.amount      !== undefined) { fields.push(`amount = $${idx++}`);      values.push(data.amount); }
  if (data.date        !== undefined) { fields.push(`date = $${idx++}`);        values.push(data.date || null); }
  if (data.category    !== undefined) { fields.push(`category = $${idx++}`);    values.push(data.category); }
  if (data.status      !== undefined) { fields.push(`status = $${idx++}`);      values.push(data.status); }
  if (data.receipt_url !== undefined) { fields.push(`receipt_url = $${idx++}`); values.push(data.receipt_url || null); }
  if (data.notes       !== undefined) { fields.push(`notes = $${idx++}`);       values.push(data.notes || null); }

  if (fields.length === 0) return getExpense(tenantId, id);

  values.push(tenantId, id);
  const res = await db.query(
    `UPDATE expense_records SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
  if (!res.rows[0]) return null;
  return ExpenseSchema.parse(res.rows[0]);
}

export async function deleteExpense(tenantId: string, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE expense_records SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  return (res.rowCount ?? 0) > 0;
}
