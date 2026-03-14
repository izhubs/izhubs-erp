import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import { DealSchema } from '@/core/schema/entities';
import { withPermission } from '@/core/engine/rbac';

async function listDeals(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  // Soft-delete: only return records that have NOT been deleted
  const result = await db.query(
    'SELECT * FROM deals WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  const countResult = await db.query('SELECT COUNT(*) FROM deals WHERE deleted_at IS NULL');
  const total = parseInt(countResult.rows[0].count);

  return NextResponse.json({
    data: result.rows,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

async function createDeal(req: Request) {
  const body = await req.json();
  const OmitAutoFields = DealSchema.omit({ id: true, createdAt: true, updatedAt: true });
  const result = OmitAutoFields.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
  }

  const { name, value, stage, contactId, companyId, ownerId, closedAt, customFields } = result.data;
  const insertResult = await db.query(
    `INSERT INTO deals (name, value, stage, contact_id, company_id, owner_id, closed_at, custom_fields) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, value, stage, contactId, companyId, ownerId, closedAt, customFields || {}]
  );
  return NextResponse.json({ data: insertResult.rows[0] }, { status: 201 });
}

export const GET = withPermission('deals:read', async (req) => {
  try { return await listDeals(req); }
  catch (e: any) { console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
});

export const POST = withPermission('deals:write', async (req) => {
  try { return await createDeal(req); }
  catch (e: any) { console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
});
