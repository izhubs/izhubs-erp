import { NextResponse } from 'next/server';
import { db } from '@/core/engine/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { projectId, eventType, eventData = {} } = data;

    if (!projectId || !eventType) {
      return NextResponse.json({ success: false, error: 'Missing projectId or eventType' }, { status: 400 });
    }

    // Verify project exists and get tenant_id
    const res = await db.query('SELECT tenant_id FROM iz_landing_projects WHERE id = $1', [projectId]);
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    const tenantId = res.rows[0].tenant_id;

    // Get basic tracking info
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Hash IP and User Agent to create an anonymous session ID
    // This provides basic deduplication of views without PII tracking
    const sessionId = crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');

    // Insert analytics event
    await db.query(`
      INSERT INTO iz_landing_analytics 
        (tenant_id, project_id, event_type, session_id, user_agent, event_data)
      VALUES 
        ($1, $2, $3, $4, $5, $6)
    `, [tenantId, projectId, eventType, sessionId, userAgent, JSON.stringify(eventData)]);

    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  } catch (err) {
    console.error('Failed to log analytics:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
