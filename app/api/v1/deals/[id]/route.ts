import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import { DealSchema } from '@/core/schema/entities';
import { withPermission } from '@/core/engine/rbac';

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export const GET = withPermission('deals:read', async (req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // Soft-delete: exclude soft-deleted records
    const result = await db.query(
      'SELECT * FROM deals WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rowCount === 0) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });

    return NextResponse.json({ data: result.rows[0] });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withPermission('deals:write', async (req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const UpdateSchema = DealSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
    const result = UpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const updates = result.data;
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)} = $${idx++}`);
      values.push(value);
    }
    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    // Only update non-deleted records
    const updateResult = await db.query(
      `UPDATE deals SET ${setClauses.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    if (updateResult.rowCount === 0) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    return NextResponse.json({ data: updateResult.rows[0] });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = withPermission('deals:delete', async (req, _claims, ctx) => {
  try {
    const id = ctx?.params?.id;
    if (!id || !isValidUUID(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // SOFT DELETE — never physically remove records
    const result = await db.query(
      `UPDATE deals SET deleted_at = NOW(), updated_at = NOW() 
       WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );
    if (result.rowCount === 0) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });

    return NextResponse.json({ data: { success: true, id: result.rows[0].id } });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
