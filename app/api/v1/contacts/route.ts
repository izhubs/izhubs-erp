import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import { ContactSchema } from '@/core/schema/entities';
import { withPermission } from '@/core/engine/rbac';

async function listContacts(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  // Soft-delete: only return records that have NOT been deleted
  const result = await db.query(
    'SELECT * FROM contacts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  const countResult = await db.query('SELECT COUNT(*) FROM contacts WHERE deleted_at IS NULL');
  const total = parseInt(countResult.rows[0].count);

  return NextResponse.json({
    data: result.rows,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

async function createContact(req: Request) {
  const body = await req.json();
  const OmitAutoFields = ContactSchema.omit({ id: true, createdAt: true, updatedAt: true });
  const result = OmitAutoFields.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
  }

  const { name, email, phone, title, companyId, ownerId, customFields } = result.data;
  const insertResult = await db.query(
    `INSERT INTO contacts (name, email, phone, title, company_id, owner_id, custom_fields) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, email, phone, title, companyId, ownerId, customFields || {}]
  );
  return NextResponse.json({ data: insertResult.rows[0] }, { status: 201 });
}

export const GET = withPermission('contacts:read', async (req) => {
  try { return await listContacts(req); }
  catch (e: any) { console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
});

export const POST = withPermission('contacts:write', async (req) => {
  try { return await createContact(req); }
  catch (e: any) { console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
});
