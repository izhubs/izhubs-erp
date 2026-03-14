import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/core/engine/db';
import { hashPassword } from '@/core/engine/auth';

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, password } = result.data;
    
    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    
    const passwordHash = hashPassword(password);
    
    // Create new user using gen_random_uuid
    const insertResult = await db.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, role, active`,
      [name, email, passwordHash, 'member']
    );
    
    return NextResponse.json({ data: insertResult.rows[0] }, { status: 201 });
    
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
