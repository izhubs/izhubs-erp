import { db } from '@/core/engine/db';
import * as net from 'net';
import { NextResponse } from 'next/server';

// Health check — used by Docker Compose healthcheck and monitoring
// GET /api/health
export async function GET() {
  const checks: Record<string, 'ok' | 'error' | 'skipped'> = {};
  let overallStatus: 'ok' | 'degraded' = 'ok';

  // 1. Database check
  try {
    await db.query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
    overallStatus = 'degraded';
  }

  // 2. Redis check — TCP ping to Redis port
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  try {
    await checkTcpPort(redisUrl);
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
    overallStatus = 'degraded';
  }

  const httpStatus = overallStatus === 'ok' ? 200 : 503;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version ?? '0.1.0',
    },
    { status: httpStatus }
  );
}

function checkTcpPort(redisUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(redisUrl);
      const host = url.hostname;
      const port = parseInt(url.port || '6379', 10);

      const socket = net.createConnection({ host, port, timeout: 2000 });
      socket.on('connect', () => { socket.destroy(); resolve(); });
      socket.on('error', (err) => { socket.destroy(); reject(err); });
      socket.on('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
    } catch (err) {
      reject(err);
    }
  });
}
