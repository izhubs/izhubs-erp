// =============================================================
// izhubs ERP — Biz-Ops Engine
// CRUD + Zod validation for project_members table.
// =============================================================

import { db } from '@/core/engine/db';
import { z } from 'zod';

export const ProjectMemberSchema = z.object({
  campaign_id: z.string().uuid(),
  user_id:     z.string().uuid(),
  role:        z.enum(['owner', 'manager', 'member', 'guest']),
  created_at:  z.coerce.date(),
  updated_at:  z.coerce.date(),
});

export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

// Input logic for assigning a member
export const AssignMemberSchema = z.object({
  campaign_id: z.string().uuid(),
  user_id:     z.string().uuid(),
  role:        z.enum(['owner', 'manager', 'member', 'guest']).default('member'),
});

// We join with the `users` table to return user details along with their project role
export const ProjectMemberWithUserSchema = ProjectMemberSchema.extend({
  user_name: z.string(),
  user_email: z.string(),
  user_avatar_url: z.string().nullable().optional(),
});
export type ProjectMemberWithUser = z.infer<typeof ProjectMemberWithUserSchema>;

export async function listMembersByCampaign(campaignId: string): Promise<ProjectMemberWithUser[]> {
  // Assuming tenant scoping is enforced by the caller (they own the campaign)
  const res = await db.query(
    `SELECT pm.*, u.name as user_name, u.email as user_email, null as user_avatar_url
     FROM project_members pm
     JOIN users u ON pm.user_id = u.id
     WHERE pm.campaign_id = $1
     ORDER BY pm.created_at ASC`,
    [campaignId]
  );
  return res.rows.map(r => ProjectMemberWithUserSchema.parse(r));
}

export async function assignMember(data: z.infer<typeof AssignMemberSchema>): Promise<ProjectMember> {
  const res = await db.query(
    `INSERT INTO project_members (campaign_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (campaign_id, user_id) 
     DO UPDATE SET role = EXCLUDED.role, updated_at = NOW()
     RETURNING *`,
    [data.campaign_id, data.user_id, data.role]
  );
  return ProjectMemberSchema.parse(res.rows[0]);
}

export async function removeMember(campaignId: string, userId: string): Promise<boolean> {
  const res = await db.query(
    `DELETE FROM project_members
     WHERE campaign_id = $1 AND user_id = $2`,
    [campaignId, userId]
  );
  return (res.rowCount ?? 0) > 0;
}
