// =============================================================
// izhubs ERP — Automation Engine
// CRUD for tenant_automations. Only this file may query the table.
// Zod-parses all DB rows before returning.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';

// ── Zod schema ──────────────────────────────────────────────

const ActionConfigSchema = z.object({
  type:       z.string().default('task'),
  subject:    z.string(),
  daysFromNow: z.number().int().min(0).default(0),
}).passthrough();

export const AutomationSchema = z.object({
  id:            z.string().uuid(),
  tenant_id:     z.string().uuid(),
  name:          z.string(),
  trigger:       z.string(),
  condition:     z.string(),
  action:        z.string(),
  action_config: ActionConfigSchema,
  is_active:     z.boolean(),
  created_at:    z.coerce.date(),
  updated_at:    z.coerce.date(),
});

export type Automation = z.infer<typeof AutomationSchema>;

export const CreateAutomationSchema = z.object({
  name:          z.string().min(1).max(200),
  trigger:       z.string().min(1),
  condition:     z.string().default('true'),
  action:        z.string().min(1).default('create_activity'),
  action_config: ActionConfigSchema,
  is_active:     z.boolean().default(true),
});

export const UpdateAutomationSchema = CreateAutomationSchema.partial();

// ── Engine functions ────────────────────────────────────────

export async function listAutomations(tenantId: string): Promise<Automation[]> {
  const res = await db.query(
    `SELECT * FROM tenant_automations
     WHERE tenant_id = $1
     ORDER BY created_at ASC`,
    [tenantId]
  );
  return res.rows.map(r => AutomationSchema.parse(r));
}

export async function getAutomation(tenantId: string, id: string): Promise<Automation | null> {
  const res = await db.query(
    `SELECT * FROM tenant_automations WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return AutomationSchema.parse(res.rows[0]);
}

export async function createAutomation(
  tenantId: string,
  data: z.infer<typeof CreateAutomationSchema>
): Promise<Automation> {
  const res = await db.query(
    `INSERT INTO tenant_automations
       (tenant_id, name, trigger, condition, action, action_config, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      tenantId,
      data.name,
      data.trigger,
      data.condition,
      data.action,
      JSON.stringify(data.action_config),
      data.is_active,
    ]
  );
  return AutomationSchema.parse(res.rows[0]);
}

export async function updateAutomation(
  tenantId: string,
  id: string,
  data: z.infer<typeof UpdateAutomationSchema>
): Promise<Automation | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name         !== undefined) { fields.push(`name = $${idx++}`);          values.push(data.name); }
  if (data.trigger      !== undefined) { fields.push(`trigger = $${idx++}`);        values.push(data.trigger); }
  if (data.condition    !== undefined) { fields.push(`condition = $${idx++}`);      values.push(data.condition); }
  if (data.action       !== undefined) { fields.push(`action = $${idx++}`);         values.push(data.action); }
  if (data.action_config !== undefined){ fields.push(`action_config = $${idx++}`);  values.push(JSON.stringify(data.action_config)); }
  if (data.is_active    !== undefined) { fields.push(`is_active = $${idx++}`);      values.push(data.is_active); }

  if (fields.length === 0) return getAutomation(tenantId, id);

  values.push(tenantId, id);
  const res = await db.query(
    `UPDATE tenant_automations SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++}
     RETURNING *`,
    values
  );
  if (!res.rows[0]) return null;
  return AutomationSchema.parse(res.rows[0]);
}

export async function deleteAutomation(tenantId: string, id: string): Promise<boolean> {
  // Hard delete is OK for automation rules (no business audit trail needed)
  const res = await db.query(
    `DELETE FROM tenant_automations WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  return (res.rowCount ?? 0) > 0;
}

/**
 * Seed automations from an IndustryTemplate's automations[] into the DB.
 * Called once on tenant setup. Safe to call multiple times (upserts by name).
 */
export async function seedAutomationsFromTemplate(
  tenantId: string,
  automations: Array<{
    name: string;
    trigger: string;
    condition: string;
    action: string;
    actionConfig: { type: string; subject: string; daysFromNow: number };
  }>
): Promise<number> {
  let inserted = 0;
  for (const a of automations) {
    const existing = await db.query(
      `SELECT id FROM tenant_automations WHERE tenant_id = $1 AND name = $2`,
      [tenantId, a.name]
    );
    if (existing.rows.length > 0) continue; // already exists — don't overwrite user's edits
    await db.query(
      `INSERT INTO tenant_automations
         (tenant_id, name, trigger, condition, action, action_config)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tenantId, a.name, a.trigger, a.condition, a.action, JSON.stringify({
        type: a.actionConfig.type,
        subject: a.actionConfig.subject,
        daysFromNow: a.actionConfig.daysFromNow,
      })]
    );
    inserted++;
  }
  return inserted;
}
