// =============================================================
// izhubs ERP — Activities / Tasks Engine
// ONLY this file queries the activities table directly.
// Activities cover: tasks, calls, emails, meetings, notes.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';
import { getTenantId } from '@/core/engine/auth';

// ---- Schemas ------------------------------------------------

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  type: z.enum(['task', 'call', 'email', 'meeting', 'note']),
  title: z.string(),
  description: z.string().nullable(),
  due_date: z.string().nullable(),         // ISO string
  completed: z.boolean(),
  completed_at: z.string().nullable(),
  priority: z.enum(['high', 'medium', 'low']).nullable(),
  assigned_to: z.string().uuid().nullable(),
  assigned_name: z.string().nullable(),    // JOIN from users
  deal_id: z.string().uuid().nullable(),
  deal_title: z.string().nullable(),       // JOIN from deals
  contact_id: z.string().uuid().nullable(),
  contact_name: z.string().nullable(),     // JOIN from contacts
  created_at: z.string(),
  updated_at: z.string(),
});

export type Activity = z.infer<typeof ActivitySchema>;

export type ActivityType = Activity['type'];
export type TaskPriority = NonNullable<Activity['priority']>;

// ---- Queries -----------------------------------------------

export interface ListActivitiesOptions {
  type?: ActivityType;
  completed?: boolean;
  assignedTo?: string;
  dueToday?: boolean;
  dueThisWeek?: boolean;
  overdue?: boolean;
  dealId?: string;
  contactId?: string;
  page?: number;
  limit?: number;
}

export async function listActivities(opts: ListActivitiesOptions = {}): Promise<{
  data: Activity[];
  total: number;
}> {
  const tenantId = await getTenantId();
  const {
    type,
    completed,
    assignedTo,
    dueToday,
    dueThisWeek,
    overdue,
    dealId,
    contactId,
    page = 1,
    limit = 50,
  } = opts;

  const conditions: string[] = ['a.tenant_id = $1'];
  const params: unknown[] = [tenantId];
  let p = 2;

  if (type)       { conditions.push(`a.type = $${p++}`); params.push(type); }
  if (completed !== undefined) { conditions.push(`a.completed = $${p++}`); params.push(completed); }
  if (assignedTo) { conditions.push(`a.assigned_to = $${p++}`); params.push(assignedTo); }
  if (dealId)     { conditions.push(`a.deal_id = $${p++}`); params.push(dealId); }
  if (contactId)  { conditions.push(`a.contact_id = $${p++}`); params.push(contactId); }
  if (dueToday)   { conditions.push(`a.due_date::date = CURRENT_DATE`); }
  if (dueThisWeek){ conditions.push(`a.due_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 6`); }
  if (overdue)    { conditions.push(`a.due_date::date < CURRENT_DATE AND a.completed = false`); }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const [rows, count] = await Promise.all([
    db.query(
      `SELECT
         a.*,
         u.name  AS assigned_name,
         d.title AS deal_title,
         c.name  AS contact_name
       FROM activities a
       LEFT JOIN users u    ON u.id = a.assigned_to
       LEFT JOIN deals d    ON d.id = a.deal_id
       LEFT JOIN contacts c ON c.id = a.contact_id
       WHERE ${where}
       ORDER BY
         a.completed ASC,
         CASE WHEN a.due_date IS NULL THEN 1 ELSE 0 END,
         a.due_date ASC,
         a.created_at DESC
       LIMIT $${p} OFFSET $${p + 1}`,
      [...params, limit, offset]
    ),
    db.query(`SELECT COUNT(*) FROM activities a WHERE ${where}`, params),
  ]);

  return {
    data: rows.rows.map((r) => ActivitySchema.parse(r)),
    total: Number(count.rows[0].count),
  };
}

export async function completeActivity(id: string): Promise<void> {
  const tenantId = await getTenantId();
  await db.query(
    `UPDATE activities
     SET completed = true, completed_at = now(), updated_at = now()
     WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
}

export async function createActivity(input: {
  type: ActivityType;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dealId?: string;
  contactId?: string;
}): Promise<Activity> {
  const tenantId = await getTenantId();
  const result = await db.query(
    `INSERT INTO activities
       (tenant_id, type, title, description, due_date, priority, assigned_to, deal_id, contact_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      tenantId,
      input.type,
      input.title,
      input.description ?? null,
      input.dueDate ?? null,
      input.priority ?? 'medium',
      input.assignedTo ?? null,
      input.dealId ?? null,
      input.contactId ?? null,
    ]
  );
  return ActivitySchema.parse(result.rows[0]);
}
