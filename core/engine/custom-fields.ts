import { db } from '@/core/engine/db';
import { CustomFieldDefinitionSchema } from '@/core/schema/entities';
import type { CustomFieldDefinition } from '@/core/schema/entities';
import { z } from 'zod';

// =============================================================
// Custom Fields Engine
// Manages CustomFieldDefinition records — the schema for custom
// JSONB fields on contacts, deals, companies, and activities.
// =============================================================

const COLUMNS = `
  id,
  entity_type  as "entityType",
  key,
  label,
  type,
  options,
  required,
  created_at   as "createdAt"
`;

type EntityType = 'contact' | 'company' | 'deal' | 'activity';

export async function listCustomFields(entityType?: EntityType): Promise<CustomFieldDefinition[]> {
  const query = entityType
    ? `SELECT ${COLUMNS} FROM custom_field_definitions WHERE entity_type = $1 ORDER BY created_at`
    : `SELECT ${COLUMNS} FROM custom_field_definitions ORDER BY entity_type, created_at`;

  const result = entityType
    ? await db.query(query, [entityType])
    : await db.query(query);

  return result.rows.map(r => CustomFieldDefinitionSchema.parse({
    ...r,
    options: r.options ?? undefined,
  }));
}

export async function getCustomField(id: string): Promise<CustomFieldDefinition | null> {
  const result = await db.query(`SELECT ${COLUMNS} FROM custom_field_definitions WHERE id = $1`, [id]);
  if (!result.rowCount || result.rowCount === 0) return null;
  const r = result.rows[0];
  return CustomFieldDefinitionSchema.parse({ ...r, options: r.options ?? undefined });
}

export async function createCustomField(
  input: Omit<CustomFieldDefinition, 'id' | 'createdAt'>
): Promise<CustomFieldDefinition> {
  const result = await db.query(
    `INSERT INTO custom_field_definitions (entity_type, key, label, type, options, required)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNS}`,
    [input.entityType, input.key, input.label, input.type, input.options ?? null, input.required]
  );
  const r = result.rows[0];
  return CustomFieldDefinitionSchema.parse({ ...r, options: r.options ?? undefined });
}

export async function deleteCustomField(id: string): Promise<string | null> {
  const result = await db.query(
    `DELETE FROM custom_field_definitions WHERE id = $1 RETURNING id`,
    [id]
  );
  if (!result.rowCount || result.rowCount === 0) return null;
  return result.rows[0].id;
}

export async function isKeyTaken(entityType: EntityType, key: string, excludeId?: string): Promise<boolean> {
  const query = excludeId
    ? `SELECT id FROM custom_field_definitions WHERE entity_type = $1 AND key = $2 AND id != $3`
    : `SELECT id FROM custom_field_definitions WHERE entity_type = $1 AND key = $2`;
  const params = excludeId ? [entityType, key, excludeId] : [entityType, key];
  const result = await db.query(query, params);
  return (result.rowCount ?? 0) > 0;
}
