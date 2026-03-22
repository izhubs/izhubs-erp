// =============================================================
// izhubs ERP — Contracts Engine
// CRUD + Zod validation for contracts table.
// Only this file may query the contracts table directly.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';
import { eventBus } from '@/core/engine/event-bus';

// ── Zod Schemas ─────────────────────────────────────────────

export const ContractSchema = z.object({
  id:              z.string().uuid(),
  tenant_id:       z.string().uuid(),
  company_id:      z.string().uuid().nullable(),
  contact_id:      z.string().uuid().nullable(),
  deal_id:         z.string().uuid().nullable(),
  title:           z.string(),
  code:            z.string().nullable(),
  total_value:     z.coerce.number(),
  collected_value: z.coerce.number(),
  currency:        z.string(),
  status:          z.enum(['draft', 'signed', 'in_progress', 'completed', 'cancelled']),
  start_date:      z.coerce.date().nullable(),
  end_date:        z.coerce.date().nullable(),
  payment_terms:   z.string().nullable(),
  notes:           z.string().nullable(),
  owner_id:        z.string().uuid().nullable(),
  custom_fields:   z.record(z.unknown()).default({}),
  deleted_at:      z.coerce.date().nullable(),
  created_at:      z.coerce.date(),
  updated_at:      z.coerce.date(),
});

export type Contract = z.infer<typeof ContractSchema>;

export const CreateContractSchema = z.object({
  title:         z.string().min(1).max(500),
  company_id:    z.string().uuid().optional(),
  contact_id:    z.string().uuid().optional(),
  deal_id:       z.string().uuid().optional(),
  code:          z.string().max(50).optional(),
  total_value:   z.number().min(0).default(0),
  currency:      z.string().max(10).default('VND'),
  status:        z.enum(['draft', 'signed', 'in_progress', 'completed', 'cancelled']).default('draft'),
  start_date:    z.string().optional(),
  end_date:      z.string().optional(),
  payment_terms: z.string().optional(),
  notes:         z.string().optional(),
  owner_id:      z.string().uuid().optional(),
  custom_fields: z.record(z.unknown()).optional(),
});

export const UpdateContractSchema = CreateContractSchema.partial();

// ── Engine Functions ────────────────────────────────────────

export async function listContracts(tenantId: string): Promise<Contract[]> {
  const res = await db.query(
    `SELECT * FROM contracts
     WHERE tenant_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return res.rows.map(r => ContractSchema.parse(r));
}

export async function getContract(tenantId: string, id: string): Promise<Contract | null> {
  const res = await db.query(
    `SELECT * FROM contracts WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return ContractSchema.parse(res.rows[0]);
}

export async function createContract(
  tenantId: string,
  data: z.infer<typeof CreateContractSchema>
): Promise<Contract> {
  const res = await db.query(
    `INSERT INTO contracts
       (tenant_id, title, company_id, contact_id, deal_id, code, total_value, currency, status,
        start_date, end_date, payment_terms, notes, owner_id, custom_fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      tenantId, data.title,
      data.company_id ?? null, data.contact_id ?? null, data.deal_id ?? null,
      data.code || null, data.total_value, data.currency, data.status,
      data.start_date || null, data.end_date || null,
      data.payment_terms || null, data.notes || null, data.owner_id || null,
      JSON.stringify(data.custom_fields || {}),
    ]
  );
  const contract = ContractSchema.parse(res.rows[0]);
  await eventBus.emit('contract.created', { contract });
  return contract;
}

export async function updateContract(
  tenantId: string,
  id: string,
  data: z.infer<typeof UpdateContractSchema>
): Promise<Contract | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.title         !== undefined) { fields.push(`title = $${idx++}`);         values.push(data.title); }
  if (data.company_id    !== undefined) { fields.push(`company_id = $${idx++}`);    values.push(data.company_id); }
  if (data.contact_id    !== undefined) { fields.push(`contact_id = $${idx++}`);    values.push(data.contact_id); }
  if (data.deal_id       !== undefined) { fields.push(`deal_id = $${idx++}`);       values.push(data.deal_id); }
  if (data.code          !== undefined) { fields.push(`code = $${idx++}`);          values.push(data.code); }
  if (data.total_value   !== undefined) { fields.push(`total_value = $${idx++}`);   values.push(data.total_value); }
  if (data.currency      !== undefined) { fields.push(`currency = $${idx++}`);      values.push(data.currency); }
  if (data.status        !== undefined) { fields.push(`status = $${idx++}`);        values.push(data.status); }
  if (data.start_date    !== undefined) { fields.push(`start_date = $${idx++}`);    values.push(data.start_date || null); }
  if (data.end_date      !== undefined) { fields.push(`end_date = $${idx++}`);      values.push(data.end_date || null); }
  if (data.payment_terms !== undefined) { fields.push(`payment_terms = $${idx++}`); values.push(data.payment_terms || null); }
  if (data.notes         !== undefined) { fields.push(`notes = $${idx++}`);         values.push(data.notes || null); }
  if (data.owner_id      !== undefined) { fields.push(`owner_id = $${idx++}`);      values.push(data.owner_id || null); }
  if (data.custom_fields !== undefined) { fields.push(`custom_fields = $${idx++}`); values.push(JSON.stringify(data.custom_fields || {})); }

  if (fields.length === 0) return getContract(tenantId, id);

  values.push(tenantId, id);
  const res = await db.query(
    `UPDATE contracts SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
  if (!res.rows[0]) return null;
  const contract = ContractSchema.parse(res.rows[0]);
  await eventBus.emit('contract.updated', { contract });
  return contract;
}

export async function deleteContract(tenantId: string, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE contracts SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if ((res.rowCount ?? 0) > 0) {
    await eventBus.emit('contract.deleted', { id });
  }
  return (res.rowCount ?? 0) > 0;
}
