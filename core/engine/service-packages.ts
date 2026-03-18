// =============================================================
// izhubs ERP — Service Packages Engine
// CRUD + Zod validation. Only this file may query service_packages.
// Migration: 008_service_packages.sql
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';

// ── Zod schema ──────────────────────────────────────────────

export const ServicePackageSchema = z.object({
  id:          z.string().uuid(),
  tenant_id:   z.string().uuid(),
  name:        z.string(),
  description: z.string().nullable(),
  price:       z.coerce.number(),
  currency:    z.string(),
  billing:     z.enum(['monthly', 'yearly', 'one_time']),
  is_active:   z.boolean(),
  created_at:  z.coerce.date(),
  updated_at:  z.coerce.date(),
  deleted_at:  z.coerce.date().nullable(),
});

export type ServicePackage = z.infer<typeof ServicePackageSchema>;

export const CreateServicePackageSchema = z.object({
  name:        z.string().min(1).max(200),
  description: z.string().optional(),
  price:       z.number().min(0),
  currency:    z.string().default('VND'),
  billing:     z.enum(['monthly', 'yearly', 'one_time']).default('monthly'),
  is_active:   z.boolean().default(true),
});

export const UpdateServicePackageSchema = CreateServicePackageSchema.partial();

// ── Engine functions ────────────────────────────────────────

export async function listServicePackages(tenantId: string): Promise<ServicePackage[]> {
  const res = await db.query(
    `SELECT * FROM service_packages
     WHERE tenant_id = $1 AND deleted_at IS NULL
     ORDER BY created_at ASC`,
    [tenantId]
  );
  return res.rows.map(r => ServicePackageSchema.parse(r));
}

export async function getServicePackage(tenantId: string, id: string): Promise<ServicePackage | null> {
  const res = await db.query(
    `SELECT * FROM service_packages WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return ServicePackageSchema.parse(res.rows[0]);
}

export async function createServicePackage(
  tenantId: string,
  data: z.infer<typeof CreateServicePackageSchema>
): Promise<ServicePackage> {
  const res = await db.query(
    `INSERT INTO service_packages
       (tenant_id, name, description, price, currency, billing, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [tenantId, data.name, data.description ?? null, data.price, data.currency, data.billing, data.is_active]
  );
  return ServicePackageSchema.parse(res.rows[0]);
}

export async function updateServicePackage(
  tenantId: string,
  id: string,
  data: z.infer<typeof UpdateServicePackageSchema>
): Promise<ServicePackage | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.name        !== undefined) { fields.push(`name = $${idx++}`);        values.push(data.name); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.price       !== undefined) { fields.push(`price = $${idx++}`);       values.push(data.price); }
  if (data.currency    !== undefined) { fields.push(`currency = $${idx++}`);    values.push(data.currency); }
  if (data.billing     !== undefined) { fields.push(`billing = $${idx++}`);     values.push(data.billing); }
  if (data.is_active   !== undefined) { fields.push(`is_active = $${idx++}`);   values.push(data.is_active); }

  if (fields.length === 0) return getServicePackage(tenantId, id);

  values.push(tenantId, id);
  const res = await db.query(
    `UPDATE service_packages SET ${fields.join(', ')}
     WHERE tenant_id = $${idx++} AND id = $${idx++} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
  if (!res.rows[0]) return null;
  return ServicePackageSchema.parse(res.rows[0]);
}

/** Soft-delete: mark as deleted (no hard DELETE) */
export async function deleteServicePackage(tenantId: string, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE service_packages SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  return (res.rowCount ?? 0) > 0;
}

/** Get subscriber count per package from deals */
export async function getPackageSubscriberCounts(tenantId: string): Promise<Record<string, number>> {
  const res = await db.query(
    `SELECT package_id, COUNT(*) as count
     FROM deals
     WHERE tenant_id = $1 AND package_id IS NOT NULL AND deleted_at IS NULL
       AND stage NOT IN ('lost', 'won')
     GROUP BY package_id`,
    [tenantId]
  );
  return Object.fromEntries(res.rows.map(r => [r.package_id, Number(r.count)]));
}
