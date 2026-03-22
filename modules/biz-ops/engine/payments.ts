// =============================================================
// izhubs ERP — Payments Engine
// CRUD + Zod validation for payment_records table.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';

export const PaymentSchema = z.object({
  id:          z.string().uuid(),
  tenant_id:   z.string().uuid(),
  contract_id: z.string().uuid(),
  amount:      z.coerce.number(),
  date:        z.coerce.date(),
  status:      z.enum(['pending', 'paid']),
  reference:   z.string().nullable(),
  notes:       z.string().nullable(),
  deleted_at:  z.coerce.date().nullable(),
  created_at:  z.coerce.date(),
  updated_at:  z.coerce.date(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const CreatePaymentSchema = z.object({
  contract_id: z.string().uuid(),
  amount:      z.number().min(0),
  date:        z.string().optional(),
  status:      z.enum(['pending', 'paid']).default('pending'),
  reference:   z.string().optional(),
  notes:       z.string().optional(),
});

export const UpdatePaymentSchema = CreatePaymentSchema.omit({ contract_id: true }).partial();

export async function listPaymentsByContract(tenantId: string, contractId: string): Promise<Payment[]> {
  const res = await db.query(
    `SELECT * FROM payment_records
     WHERE tenant_id = $1 AND contract_id = $2 AND deleted_at IS NULL
     ORDER BY date DESC, created_at DESC`,
    [tenantId, contractId]
  );
  return res.rows.map(r => PaymentSchema.parse(r));
}

export async function getPayment(tenantId: string, id: string): Promise<Payment | null> {
  const res = await db.query(
    `SELECT * FROM payment_records WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return PaymentSchema.parse(res.rows[0]);
}

export async function createPayment(
  tenantId: string,
  data: z.infer<typeof CreatePaymentSchema>
): Promise<Payment> {
  const res = await db.query(
    `INSERT INTO payment_records
       (tenant_id, contract_id, amount, date, status, reference, notes)
     VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7)
     RETURNING *`,
    [
      tenantId, data.contract_id, data.amount,
      data.date || null, data.status,
      data.reference || null, data.notes || null,
    ]
  );
  return PaymentSchema.parse(res.rows[0]);
}

export async function updatePayment(
  tenantId: string,
  id: string,
  data: z.infer<typeof UpdatePaymentSchema>
): Promise<Payment | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.amount    !== undefined) { fields.push(`amount = $${idx++}`);    values.push(data.amount); }
  if (data.date      !== undefined) { fields.push(`date = $${idx++}`);      values.push(data.date || null); }
  if (data.status    !== undefined) { fields.push(`status = $${idx++}`);    values.push(data.status); }
  if (data.reference !== undefined) { fields.push(`reference = $${idx++}`); values.push(data.reference || null); }
  if (data.notes     !== undefined) { fields.push(`notes = $${idx++}`);     values.push(data.notes || null); }

  if (fields.length === 0) return getPayment(tenantId, id);

  values.push(tenantId, id);
  const res = await db.query(
    `UPDATE payment_records SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
  if (!res.rows[0]) return null;
  return PaymentSchema.parse(res.rows[0]);
}

export async function deletePayment(tenantId: string, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE payment_records SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  return (res.rowCount ?? 0) > 0;
}
