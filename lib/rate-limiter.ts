// =============================================================
// izhubs ERP — Rate Limiter
// Sliding window rate limiter using Redis INCR + EXPIRE.
// Protects API routes from abuse on self-hosted instances.
//
// STATUS: Ready to activate — requires `redis` package:
//   npm install redis @types/redis
// Then uncomment the Redis implementation below.
// =============================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  identifier: string,   // IP address or user ID
  limit: number = 100,  // requests per window
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const resetAt = new Date(Date.now() + windowSeconds * 1000);

  // TODO (SEC-1): Uncomment after `npm install redis`
  // const redis = await import('redis').then(m => m.createClient({ url: process.env.REDIS_URL }))
  // await redis.connect()
  // const key = `rl:${identifier}`
  // const count = await redis.incr(key)
  // if (count === 1) await redis.expire(key, windowSeconds)
  // await redis.disconnect()
  // return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt }

  // Graceful no-op until Redis is installed
  return { allowed: true, remaining: limit, resetAt };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
    ...(result.allowed ? {} : { 'Retry-After': '60' }),
  };
}
