// =============================================================
// izhubs ERP — Biz-Ops Engine
// CRUD + Zod validation for campaign_tasks table.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';

export const TaskSchema = z.object({
  id:           z.string().uuid(),
  tenant_id:    z.string().uuid(),
  campaign_id:  z.string().uuid(),
  title:        z.string().min(1),
  description:  z.string().nullable(),
  status:       z.enum(['todo', 'in_progress', 'review', 'done']),
  priority:     z.enum(['low', 'medium', 'high', 'urgent']),
  assignee_id:  z.string().uuid().nullable(),
  due_date:     z.coerce.date().nullable(),
  deleted_at:   z.coerce.date().nullable(),
  created_at:   z.coerce.date(),
  updated_at:   z.coerce.date(),
});

export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = z.object({
  campaign_id:  z.string().uuid(),
  title:        z.string().min(1),
  description:  z.string().optional(),
  status:       z.enum(['todo', 'in_progress', 'review', 'done']).default('todo'),
  priority:     z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignee_id:  z.string().uuid().optional(),
  due_date:     z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.omit({ campaign_id: true }).partial();

export async function listTasksByCampaign(tenantId: string, campaignId: string): Promise<Task[]> {
  const res = await db.query(
    `SELECT * FROM campaign_tasks
     WHERE tenant_id = $1 AND campaign_id = $2 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tenantId, campaignId]
  );
  return res.rows.map(r => TaskSchema.parse(r));
}

export async function getTask(tenantId: string, id: string): Promise<Task | null> {
  const res = await db.query(
    `SELECT * FROM campaign_tasks WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return TaskSchema.parse(res.rows[0]);
}

export async function createTask(
  tenantId: string,
  data: z.infer<typeof CreateTaskSchema>
): Promise<Task> {
  const res = await db.query(
    `INSERT INTO campaign_tasks
       (tenant_id, campaign_id, title, description, status, priority, assignee_id, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      tenantId, data.campaign_id, data.title, data.description || null,
      data.status, data.priority, data.assignee_id || null, data.due_date || null
    ]
  );
  return TaskSchema.parse(res.rows[0]);
}

export async function updateTask(
  tenantId: string,
  id: string,
  data: z.infer<typeof UpdateTaskSchema>
): Promise<Task | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.title       !== undefined) { fields.push(`title = $${idx++}`);       values.push(data.title); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description || null); }
  if (data.status      !== undefined) { fields.push(`status = $${idx++}`);      values.push(data.status); }
  if (data.priority    !== undefined) { fields.push(`priority = $${idx++}`);    values.push(data.priority); }
  if (data.assignee_id !== undefined) { fields.push(`assignee_id = $${idx++}`); values.push(data.assignee_id || null); }
  if (data.due_date    !== undefined) { fields.push(`due_date = $${idx++}`);    values.push(data.due_date || null); }

  if (fields.length === 0) return getTask(tenantId, id);
  fields.push(`updated_at = NOW()`);

  values.push(tenantId, id);
  const res = await db.query(
    `UPDATE campaign_tasks SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
  if (!res.rows[0]) return null;
  return TaskSchema.parse(res.rows[0]);
}

export async function deleteTask(tenantId: string, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE campaign_tasks SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  return (res.rowCount ?? 0) > 0;
}
