import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getRequestContext } from './request-context';

// =============================================================
// izhubs ERP — ApiResponse Factory
// ALL API routes MUST use these helpers. Never call
// NextResponse.json() directly in a route handler.
// =============================================================

// Machine-readable error codes — use in ApiResponse.error(msg, status, {}, 'CODE')
export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const ApiResponse = {
  /**
   * 200 / 201 success with data payload.
   */
  success<T>(data: T, status: 200 | 201 = 200, meta?: object): NextResponse {
    return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status });
  },

  /**
   * 4xx / 5xx error with optional machine-readable code.
   * Use ErrorCodes constants for the `code` field.
   */
  error(
    message: string,
    status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 = 500,
    details?: object,
    code?: ErrorCode
  ): NextResponse {
    return NextResponse.json(
      { success: false, error: { message, ...(code ? { code } : {}), ...(details ? { details } : {}) } },
      { status }
    );
  },

  /**
   * Convenience: parse a ZodError into a 422 Unprocessable Entity response.
   */
  validationError(err: ZodError): NextResponse {
    return NextResponse.json(
      { success: false, error: { code: ErrorCodes.VALIDATION_FAILED, message: 'Validation failed', details: err.format() } },
      { status: 422 }
    );
  },

  /**
   * Convenience: wrap unknown catch blocks — logs internally, returns 500.
   *
   * Automatically captures tenantId + userId from AsyncLocalStorage requestContext
   * (set by withPermission) — zero changes needed in route handlers.
   *
   * @param context  - Short tag identifying the route, e.g. 'deals.update'
   * @param reqMeta  - Extra payload for reproduction, e.g. { dealId, stage }
   */
  serverError(err: unknown, context?: string, reqMeta?: Record<string, unknown>): NextResponse {
    const message = err instanceof Error ? err.message : String(err);
    const stack   = err instanceof Error ? (err.stack ?? '') : '';

    // Auto-capture identity from request context (set by withPermission)
    const reqCtx  = getRequestContext();
    const tenantId = reqCtx?.tenantId ?? 'unknown';
    const userId   = reqCtx?.userId   ?? 'unknown';

    // Structured console log — visible in Next.js dev terminal and production stdout
    console.error(
      `\n🚨 [API 500] ${context ?? 'unknown'}\n` +
      `   tenant : ${tenantId}\n` +
      `   user   : ${userId}\n` +
      `   error  : ${message}\n` +
      `   stack  : ${stack.substring(0, 600)}\n` +
      (reqMeta ? `   meta   : ${JSON.stringify(reqMeta)}\n` : ''),
      err
    );

    const dbMeta = {
      tenantId,
      userId,
      stack: stack.substring(0, 1200),
      ...(reqMeta ?? {}),
    };

    // Persist to system_logs for QA & developer trace — fire and forget
    import('@/core/engine/db').then(({ db }) => {
      db.query(
        `INSERT INTO system_logs (level, context, message, meta) VALUES ($1, $2, $3, $4)`,
        ['error', context ?? 'API_FATAL', message, JSON.stringify(dbMeta)]
      ).catch(console.error);
    }).catch(console.error);

    // Auto-notify via Telegram (only if configured)
    if (process.env.TELEGRAM_ADMIN_CHAT_ID) {
      import('../../lib/messaging').then(({ notify }) => {
        const text =
          `🚨 *API ERROR* — \`${context ?? 'unknown'}\`\n` +
          `*Tenant:* \`${tenantId}\`  *User:* \`${userId}\`\n` +
          `*Error:* ${message}`;
        notify('telegram', process.env.TELEGRAM_ADMIN_CHAT_ID as string, text).catch(() => {});
      }).catch(() => {});
    }

    return NextResponse.json(
      { success: false, error: { code: ErrorCodes.INTERNAL_ERROR, message: 'Internal server error' } },
      { status: 500 }
    );
  },
};
