// =============================================================
// izhubs ERP — Campaigns (Projects) Engine
// CRUD + Zod validation for campaigns table.
// Only this file may query the campaigns table directly.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';
import { eventBus } from '@/core/engine/event-bus';

// ── Zod Schemas ─────────────────────────────────────────────

export const CampaignSchema = z.object({
  id:               z.string().uuid(),
  tenant_id:        z.string().uuid(),
  contract_id:      z.string().uuid(),
  name:             z.string(),
  type:             z.enum(['seo', 'ads', 'social', 'web', 'construction', 'general']),
  allocated_budget: z.coerce.number(),
  actual_cogs:      z.coerce.number(),
  stage:            z.string(),
  health:           z.enum(['healthy', 'at_risk', 'delayed', 'completed']),
  start_date:       z.coerce.date().nullable(),
  end_date:         z.coerce.date().nullable(),
  owner_id:         z.string().uuid().nullable(),
  custom_fields:    z.record(z.unknown()).default({}),
  deleted_at:       z.coerce.date().nullable(),
  created_at:       z.coerce.date(),
  updated_at:       z.coerce.date(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const CreateCampaignSchema = z.object({
  contract_id:      z.string().uuid(),
  name:             z.string().min(1).max(500),
  type:             z.enum(['seo', 'ads', 'social', 'web', 'construction', 'general']).default('general'),
  allocated_budget: z.number().min(0).default(0),
  stage:            z.string().max(50).default('planning'),
  health:           z.enum(['healthy', 'at_risk', 'delayed', 'completed']).default('healthy'),
  start_date:       z.string().optional(),
  end_date:         z.string().optional(),
  owner_id:         z.string().uuid().optional(),
  custom_fields:    z.record(z.unknown()).optional(),
});

export const UpdateCampaignSchema = CreateCampaignSchema.omit({ contract_id: true }).partial();

// ── Engine Functions ────────────────────────────────────────

export async function listCampaigns(tenantId: string): Promise<Campaign[]> {
  const res = await db.query(
    `SELECT * FROM campaigns
     WHERE tenant_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tenantId]
  );
  return res.rows.map(r => CampaignSchema.parse(r));
}

export async function listCampaignsByContract(tenantId: string, contractId: string): Promise<Campaign[]> {
  const res = await db.query(
    `SELECT * FROM campaigns
     WHERE tenant_id = $1 AND contract_id = $2 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tenantId, contractId]
  );
  return res.rows.map(r => CampaignSchema.parse(r));
}

export async function getCampaign(tenantId: string, id: string): Promise<Campaign | null> {
  const res = await db.query(
    `SELECT * FROM campaigns WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return CampaignSchema.parse(res.rows[0]);
}

export async function createCampaign(
  tenantId: string,
  data: z.infer<typeof CreateCampaignSchema>
): Promise<Campaign> {
  const res = await db.query(
    `INSERT INTO campaigns
       (tenant_id, contract_id, name, type, allocated_budget, stage, health,
        start_date, end_date, owner_id, custom_fields)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      tenantId, data.contract_id, data.name, data.type, data.allocated_budget,
      data.stage, data.health,
      data.start_date ?? null, data.end_date ?? null, data.owner_id ?? null,
      JSON.stringify(data.custom_fields ?? {}),
    ]
  );
  const campaign = CampaignSchema.parse(res.rows[0]);
  await eventBus.emit('campaign.created', { campaign });
  return campaign;
}

export async function updateCampaign(
  tenantId: string,
  id: string,
  data: z.infer<typeof UpdateCampaignSchema>
): Promise<Campaign | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name             !== undefined) { fields.push(`name = $${idx++}`);             values.push(data.name); }
  if (data.type             !== undefined) { fields.push(`type = $${idx++}`);             values.push(data.type); }
  if (data.allocated_budget !== undefined) { fields.push(`allocated_budget = $${idx++}`); values.push(data.allocated_budget); }
  if (data.stage            !== undefined) { fields.push(`stage = $${idx++}`);            values.push(data.stage); }
  if (data.health           !== undefined) { fields.push(`health = $${idx++}`);           values.push(data.health); }
  if (data.start_date       !== undefined) { fields.push(`start_date = $${idx++}`);       values.push(data.start_date); }
  if (data.end_date         !== undefined) { fields.push(`end_date = $${idx++}`);         values.push(data.end_date); }
  if (data.owner_id         !== undefined) { fields.push(`owner_id = $${idx++}`);         values.push(data.owner_id); }
  if (data.custom_fields    !== undefined) { fields.push(`custom_fields = $${idx++}`);    values.push(JSON.stringify(data.custom_fields)); }

  if (fields.length === 0) return getCampaign(tenantId, id);

  values.push(tenantId, id);
  const res = await db.query(
    `UPDATE campaigns SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
  if (!res.rows[0]) return null;
  const campaign = CampaignSchema.parse(res.rows[0]);
  await eventBus.emit('campaign.updated', { campaign });
  return campaign;
}

export async function deleteCampaign(tenantId: string, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE campaigns SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if ((res.rowCount ?? 0) > 0) {
    await eventBus.emit('campaign.deleted', { id });
  }
  return (res.rowCount ?? 0) > 0;
}
