// =============================================================
// izhubs ERP — Contract Milestones Engine
// CRUD + Zod validation for contract_milestones table.
// Only this file may query the contract_milestones table directly.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';
import { eventBus } from '@/core/engine/event-bus';

// ── Zod Schemas ─────────────────────────────────────────────

export const MilestoneSchema = z.object({
  id:             z.string().uuid(),
  tenant_id:      z.string().uuid(),
  contract_id:    z.string().uuid(),
  title:          z.string(),
  amount:         z.coerce.number(),
  percentage:     z.coerce.number().nullable(),
  due_date:       z.coerce.date().nullable(),
  status:         z.enum(['expected', 'invoiced', 'received', 'overdue']),
  received_date:  z.coerce.date().nullable(),
  invoice_number: z.string().nullable(),
  notes:          z.string().nullable(),
  sort_order:     z.number(),
  deleted_at:     z.coerce.date().nullable(),
  created_at:     z.coerce.date(),
  updated_at:     z.coerce.date(),
});

export type Milestone = z.infer<typeof MilestoneSchema>;

export const CreateMilestoneSchema = z.object({
  contract_id:    z.string().uuid(),
  title:          z.string().min(1).max(500),
  amount:         z.number().min(0).default(0),
  percentage:     z.number().min(0).max(100).optional(),
  due_date:       z.string().optional(),
  status:         z.enum(['expected', 'invoiced', 'received', 'overdue']).default('expected'),
  invoice_number: z.string().max(100).optional(),
  notes:          z.string().optional(),
  sort_order:     z.number().int().default(0),
});

export const UpdateMilestoneSchema = CreateMilestoneSchema.omit({ contract_id: true }).partial();

// ── Engine Functions ────────────────────────────────────────

export async function listMilestones(tenantId: string, contractId: string): Promise<Milestone[]> {
  const res = await db.query(
    `SELECT * FROM contract_milestones
     WHERE tenant_id = $1 AND contract_id = $2 AND deleted_at IS NULL
     ORDER BY sort_order ASC, created_at ASC`,
    [tenantId, contractId]
  );
  return res.rows.map(r => MilestoneSchema.parse(r));
}

export async function getMilestone(tenantId: string, id: string): Promise<Milestone | null> {
  const res = await db.query(
    `SELECT * FROM contract_milestones WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return MilestoneSchema.parse(res.rows[0]);
}

export async function createMilestone(
  tenantId: string,
  data: z.infer<typeof CreateMilestoneSchema>
): Promise<Milestone> {
  const res = await db.query(
    `INSERT INTO contract_milestones
       (tenant_id, contract_id, title, amount, percentage, due_date, status,
        invoice_number, notes, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      tenantId, data.contract_id, data.title, data.amount,
      data.percentage ?? null, data.due_date ?? null, data.status,
      data.invoice_number ?? null, data.notes ?? null, data.sort_order,
    ]
  );
  const milestone = MilestoneSchema.parse(res.rows[0]);
  await eventBus.emit('milestone.created', { milestone });
  return milestone;
}

export async function updateMilestone(
  tenantId: string,
  id: string,
  data: z.infer<typeof UpdateMilestoneSchema>
): Promise<Milestone | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.title          !== undefined) { fields.push(`title = $${idx++}`);          values.push(data.title); }
  if (data.amount         !== undefined) { fields.push(`amount = $${idx++}`);         values.push(data.amount); }
  if (data.percentage     !== undefined) { fields.push(`percentage = $${idx++}`);     values.push(data.percentage); }
  if (data.due_date       !== undefined) { fields.push(`due_date = $${idx++}`);       values.push(data.due_date); }
  if (data.status         !== undefined) { fields.push(`status = $${idx++}`);         values.push(data.status); }
  if (data.invoice_number !== undefined) { fields.push(`invoice_number = $${idx++}`); values.push(data.invoice_number); }
  if (data.notes          !== undefined) { fields.push(`notes = $${idx++}`);          values.push(data.notes); }
  if (data.sort_order     !== undefined) { fields.push(`sort_order = $${idx++}`);     values.push(data.sort_order); }

  if (fields.length === 0) return getMilestone(tenantId, id);

  values.push(tenantId, id);
  const res = await db.query(
    `UPDATE contract_milestones SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
  if (!res.rows[0]) return null;
  const milestone = MilestoneSchema.parse(res.rows[0]);
  await eventBus.emit('milestone.updated', { milestone });
  return milestone;
}

export async function deleteMilestone(tenantId: string, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE contract_milestones SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if ((res.rowCount ?? 0) > 0) {
    await eventBus.emit('milestone.deleted', { id });
  }
  return (res.rowCount ?? 0) > 0;
}
