import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import { ContactSchema } from '@/core/schema/entities';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const result = await db.query(
      'SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM contacts');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      data: result.rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Contacts GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Partial Zod parse since ID and dates are auto-generated
    const OmitAutoFields = ContactSchema.omit({ 
      id: true, 
      createdAt: true, 
      updatedAt: true 
    });

    const result = OmitAutoFields.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, phone, title, companyId, ownerId, customFields } = result.data;

    const insertResult = await db.query(
      `INSERT INTO contacts (name, email, phone, title, company_id, owner_id, custom_fields) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, email, phone, title, companyId, ownerId, customFields || {}]
    );

    return NextResponse.json({ data: insertResult.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Contacts POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
