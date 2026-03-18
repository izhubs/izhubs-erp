import { ApiResponse, ErrorCodes } from '@/core/engine/response';

// =============================================================
// Unit Tests — ApiResponse Factory (Phase 2.3)
// Tests all response helper methods. Uses next/server mock from
// tests/__mocks__/next-server.ts — no real NextResponse needed.
// =============================================================

// Suppress console.error in serverError tests
beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => { (console.error as jest.Mock).mockRestore(); });

// Unwrap the mock response body (mock returns body directly, not via async json())
function getBody(res: { status: number; body?: unknown; json?: () => Promise<unknown> }) {
  // Our mock stores body directly on the response object
  return Promise.resolve((res as { body: unknown }).body);
}

describe('ApiResponse', () => {
  describe('.success()', () => {
    it('returns 200 with data', async () => {
      const res = ApiResponse.success({ id: '1', name: 'Alice' });
      expect(res.status).toBe(200);
      const body = await getBody(res as never);
      expect((body as { data: unknown }).data).toEqual({ id: '1', name: 'Alice' });
    });

    it('returns 201 when status arg is 201', () => {
      const res = ApiResponse.success({ id: 'new' }, 201);
      expect(res.status).toBe(201);
    });

    it('includes meta when provided', async () => {
      const meta = { total: 100, page: 1, limit: 25, totalPages: 4 };
      const res = ApiResponse.success([], 200, meta);
      const body = await getBody(res as never) as { meta: typeof meta };
      expect(body.meta).toEqual(meta);
    });

    it('does not include meta key when not provided', async () => {
      const res = ApiResponse.success({ x: 1 });
      const body = await getBody(res as never) as { meta?: unknown };
      expect(body.meta).toBeUndefined();
    });
  });

  describe('.error()', () => {
    it('returns correct 403 status code', () => {
      const res = ApiResponse.error('Not allowed', 403);
      expect(res.status).toBe(403);
    });

    it('returns 404 status code', () => {
      const res = ApiResponse.error('Not found', 404);
      expect(res.status).toBe(404);
    });

    it('supports 429 rate limit status', () => {
      const res = ApiResponse.error('Too many requests', 429);
      expect(res.status).toBe(429);
    });

    it('defaults to 500', () => {
      const res = ApiResponse.error('Oops');
      expect(res.status).toBe(500);
    });

    it('includes error message in body', async () => {
      const res = ApiResponse.error('Not found', 404);
      const body = await getBody(res as never) as { error: { message: string } };
      expect(body.error.message).toBe('Not found');
    });

    it('includes error code when provided', async () => {
      const res = ApiResponse.error('Not found', 404, {}, 'NOT_FOUND');
      const body = await getBody(res as never) as { error: { code: string } };
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('.validationError()', () => {
    it('returns 422', () => {
      const { z } = require('zod');
      const result = z.object({ name: z.string() }).safeParse({ name: 123 });
      if (!result.success) {
        const res = ApiResponse.validationError(result.error);
        expect(res.status).toBe(422);
      }
    });

    it('body contains VALIDATION_FAILED code', async () => {
      const { z } = require('zod');
      const result = z.object({ email: z.string().email() }).safeParse({ email: 'bad' });
      if (!result.success) {
        const res = ApiResponse.validationError(result.error);
        const body = await getBody(res as never) as { error: { code: string } };
        expect(body.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      }
    });
  });

  describe('.serverError()', () => {
    it('returns 500', () => {
      const res = ApiResponse.serverError(new Error('DB timeout'), 'test.context');
      expect(res.status).toBe(500);
    });

    it('returns INTERNAL_ERROR code', async () => {
      const res = ApiResponse.serverError(new Error('fail'));
      const body = await getBody(res as never) as { error: { code: string } };
      expect(body.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
    });

    it('handles non-Error throwables gracefully', () => {
      const res = ApiResponse.serverError('string error');
      expect(res.status).toBe(500);
    });
  });

  describe('ErrorCodes', () => {
    it('has all expected codes', () => {
      expect(ErrorCodes.UNAUTHORIZED).toBeDefined();
      expect(ErrorCodes.FORBIDDEN).toBeDefined();
      expect(ErrorCodes.NOT_FOUND).toBeDefined();
      expect(ErrorCodes.VALIDATION_FAILED).toBeDefined();
      expect(ErrorCodes.INTERNAL_ERROR).toBeDefined();
    });
  });
});
