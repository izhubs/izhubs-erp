import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

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
   */
  serverError(err: unknown, context?: string): NextResponse {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[API Error]${context ? ` [${context}]` : ''}: ${message}`, err);
    return NextResponse.json(
      { success: false, error: { code: ErrorCodes.INTERNAL_ERROR, message: 'Internal server error' } },
      { status: 500 }
    );
  },
};

