// =============================================================
// izhubs ERP — Rate Limiter
// Sliding window rate limiter using Redis.
// Protects API routes from abuse on self-hosted instances.
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
  // TODO: implement with Redis INCR + EXPIRE
  // const redis = getRedisClient();
  // const key = `rate_limit:${identifier}`;
  // const count = await redis.incr(key);
  // if (count === 1) await redis.expire(key, windowSeconds);
  // return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt: ... };

  return { allowed: true, remaining: limit, resetAt: new Date(Date.now() + windowSeconds * 1000) };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
    ...(result.allowed ? {} : { 'Retry-After': '60' }),
  };
}
