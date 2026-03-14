import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// =============================================================
// izhubs ERP — ApiResponse Factory
// ALL API routes MUST use these helpers. Never call
// NextResponse.json() directly in a route handler.
// =============================================================

export const ApiResponse = {
  /**
   * 200 / 201 success with data payload.
   */
  success<T>(data: T, status: 200 | 201 = 200, meta?: object): NextResponse {
    return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status });
  },

  /**
   * 4xx / 5xx error. Provide a machine-readable code and human message.
   */
  error(
    message: string,
    status: 400 | 401 | 403 | 404 | 409 | 422 | 500 = 500,
    details?: object
  ): NextResponse {
    return NextResponse.json(
      { error: { message, ...(details ? { details } : {}) } },
      { status }
    );
  },

  /**
   * Convenience: parse a ZodError into a 422 Unprocessable Entity response.
   */
  validationError(err: ZodError): NextResponse {
    return NextResponse.json(
      { error: { message: 'Validation failed', details: err.format() } },
      { status: 422 }
    );
  },

  /**
   * Convenience: wrap unknown catch blocks — logs internally, returns 500.
   */
  serverError(err: unknown, context?: string): NextResponse {
    console.error(`[API Error]${context ? ` [${context}]` : ''}`, err);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  },
};
