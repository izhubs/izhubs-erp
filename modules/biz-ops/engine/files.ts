// =============================================================
// izhubs ERP — Biz-Ops Engine
// CRUD + Zod validation for campaign_files table.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';

export const FileSchema = z.object({
  id:           z.string().uuid(),
  tenant_id:    z.string().uuid(),
  campaign_id:  z.string().uuid(),
  file_name:    z.string().min(1),
  file_url:     z.string().url(),
  size_bytes:   z.coerce.number(),
  uploaded_by:  z.string().uuid().nullable(),
  deleted_at:   z.coerce.date().nullable(),
  created_at:   z.coerce.date(),
  updated_at:   z.coerce.date(),
});

export type FileRecord = z.infer<typeof FileSchema>;

export const CreateFileSchema = z.object({
  campaign_id:  z.string().uuid(),
  file_name:    z.string().min(1),
  file_url:     z.string().url(),
  size_bytes:   z.number().positive(),
  uploaded_by:  z.string().uuid().optional(),
});

export async function listFilesByCampaign(tenantId: string, campaignId: string): Promise<FileRecord[]> {
  const res = await db.query(
    `SELECT * FROM campaign_files
     WHERE tenant_id = $1 AND campaign_id = $2 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [tenantId, campaignId]
  );
  return res.rows.map(r => FileSchema.parse(r));
}

export async function getFile(tenantId: string, id: string): Promise<FileRecord | null> {
  const res = await db.query(
    `SELECT * FROM campaign_files WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  if (!res.rows[0]) return null;
  return FileSchema.parse(res.rows[0]);
}

export async function createFile(
  tenantId: string,
  data: z.infer<typeof CreateFileSchema>
): Promise<FileRecord> {
  const res = await db.query(
    `INSERT INTO campaign_files
       (tenant_id, campaign_id, file_name, file_url, size_bytes, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      tenantId, data.campaign_id, data.file_name, data.file_url,
      data.size_bytes, data.uploaded_by || null
    ]
  );
  return FileSchema.parse(res.rows[0]);
}

export async function deleteFile(tenantId: string, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE campaign_files SET deleted_at = NOW()
     WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
    [id, tenantId]
  );
  return (res.rowCount ?? 0) > 0;
}
