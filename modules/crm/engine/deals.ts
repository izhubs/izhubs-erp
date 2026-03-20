import { db, buildInsertQuery, buildUpdateQuery } from '@/core/engine/db';
import { DealSchema, DealStageSchema } from '@/core/schema/entities';
import type { Deal, DealStage } from '@/core/schema/entities';
import { eventBus } from '@/core/engine/event-bus';

// =============================================================
// Deals Engine
// ONLY layer allowed to query the deals table directly.
// Always parses DB output through Zod before returning.
// No cross-imports from other engine modules.
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
  stage?: DealStage;
}

export interface ListResult<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function listDeals({ page = 1, limit = 50, stage }: ListOptions = {}): Promise<ListResult<Deal>> {
  const offset = (page - 1) * limit;
  const stageFilter = stage ? `AND stage = $3` : '';
  const stageParam = stage ? [limit, offset, stage] : [limit, offset];

  const [rows, count] = await Promise.all([
    db.query(
      `SELECT ${COLUMNS} FROM deals WHERE deleted_at IS NULL ${stageFilter} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      stageParam
    ),
    db.query(
      `SELECT COUNT(*) FROM deals WHERE deleted_at IS NULL${stage ? ` AND stage = $1` : ''}`,
      stage ? [stage] : []
    ),
  ]);
  const total = parseInt(count.rows[0].count);
  return {
    data: rows.rows.map(row => DealSchema.parse(row)),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getDealsByStage(stage: DealStage): Promise<Deal[]> {
  DealStageSchema.parse(stage); // validate before hitting DB
  const result = await db.query(
    `SELECT ${COLUMNS} FROM deals WHERE stage = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
    [stage]
  );
  return result.rows.map(row => DealSchema.parse(row));
}

export async function getDeal(id: string): Promise<Deal | null> {
  const result = await db.query(`SELECT ${COLUMNS} FROM deals WHERE id = $1 AND deleted_at IS NULL`, [id]);
  if (result.rowCount === 0) return null;
  return DealSchema.parse(result.rows[0]);
}

export async function createDeal(input: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
  const query = buildInsertQuery('deals', { ...input, customFields: input.customFields ?? {} }, COLUMNS);
  const result = await db.query(query.text, query.values);
  const deal = DealSchema.parse(result.rows[0]);
  await eventBus.emit('deal.created', { deal });
  return deal;
}

export async function updateDeal(id: string, input: Partial<Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Deal | null> {
  const query = buildUpdateQuery('deals', input, 'id', id, COLUMNS);
  if (!query) return getDeal(id);

  const previousDeal = await getDeal(id);
  if (!previousDeal) return null;

  const result = await db.query(query.text, query.values);
  if (result.rowCount === 0) return null;
  const deal = DealSchema.parse(result.rows[0]);

  // Emit semantic stage events
  if (input.stage && previousDeal && input.stage !== previousDeal.stage) {
    await eventBus.emit('deal.stage_changed', {
      deal,
      fromStage: previousDeal.stage,
      toStage: input.stage,
    });
    if (input.stage === 'won') await eventBus.emit('deal.won', { deal });
    if (input.stage === 'lost') await eventBus.emit('deal.lost', { deal });
  } else {
    await eventBus.emit('deal.updated', { deal, changes: input });
  }

  return deal;
}

export async function softDeleteDeal(id: string): Promise<string | null> {
  const result = await db.query(
    `UPDATE deals SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  if (result.rowCount === 0) return null;
  const dealId = result.rows[0].id as string;
  await eventBus.emit('deal.deleted', { dealId });
  return dealId;
}

export async function bulkDeleteDeals(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  const result = await db.query(
    `UPDATE deals SET deleted_at = NOW(), updated_at = NOW() WHERE id IN (${placeholders}) AND deleted_at IS NULL RETURNING id`,
    ids
  );
  const deletedIds = result.rows.map(r => r.id as string);
  for (const id of deletedIds) {
    await eventBus.emit('deal.deleted', { dealId: id });
  }
  return deletedIds;
}
