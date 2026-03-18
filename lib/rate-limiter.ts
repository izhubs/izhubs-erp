// =============================================================
// izhubs ERP — Rate Limiter (Redis sliding window)
// Applied to: POST /auth/login, /auth/register, /api/v1/import
// Graceful no-op when REDIS_URL is not set (dev without Redis).
// =============================================================

import { createClient } from 'redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

let _client: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!_client) {
    _client = createClient({ url: process.env.REDIS_URL });
    _client.on('error', () => { /* silent — Redis optional */ });
    await _client.connect();
  }
  return _client;
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const resetAt = new Date(Date.now() + windowSeconds * 1000);
  const redis = await getRedis().catch(() => null);

  if (!redis) {
    // No Redis configured — graceful passthrough
    return { allowed: true, remaining: limit, resetAt };
  }

  const key = `rl:${identifier}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSeconds);

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
    ...(result.allowed ? {} : { 'Retry-After': '60' }),
  };
}
