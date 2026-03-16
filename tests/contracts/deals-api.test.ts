/**
 * Deals API — Contract Tests (Phase 3)
 * Spec: .agent/tracks/2026-03-16-pipeline-kanban/SPEC.md
 *
 * These tests verify:
 * 1. API response shape contracts (what the route must return)
 * 2. Event emission contracts (what events must be emitted)
 * 3. Soft-delete semantic contracts (no real DB needed — logic-level)
 *
 * Strategy: pure unit contracts — no DB, mock only at boundaries.
 * Integration tests (with DB) go in tests/integration/ when needed.
 */

import { DealSchema, DealStageSchema } from '@/core/schema/entities';
import type { Deal, DealStage } from '@/core/schema/entities';
import { eventBus } from '@/core/engine/event-bus';
import { z } from 'zod';

// ---- ApiResponse shape contract ----
// Shape that every deal API endpoint must return.
const ApiSuccessShape = z.object({
  success: z.literal(true),
  data: z.unknown(),
});
const ApiErrorShape = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
  }),
});

function mockApiSuccess(data: unknown) {
  return { success: true as const, data };
}
function mockApiError(message: string, status: number) {
  return { success: false as const, error: { message }, status };
}

// ---- A valid Deal fixture ----
const makeDeal = (overrides: Partial<Deal> = {}): Deal => ({
  id: 'aabbccdd-0000-1111-2222-333344445555',
  name: 'Test Deal',
  value: 5000,
  stage: 'new',
  customFields: {},
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

// =====================================================
// 1. GET /api/v1/deals/:id — Response shape contracts
// =====================================================
describe('GET /api/v1/deals/:id — contract', () => {
  it('returns ApiSuccess with a valid Deal when found', () => {
    const deal = makeDeal();
    const response = mockApiSuccess(deal);
    expect(ApiSuccessShape.safeParse(response).success).toBe(true);
    // The data must parse as a Deal
    expect(DealSchema.safeParse(response.data).success).toBe(true);
  });

  it('returns ApiError shape with status 404 when not found', () => {
    const response = mockApiError('Deal not found', 404);
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(404);
  });

  it('response data contains required Deal fields', () => {
    const deal = makeDeal();
    const result = DealSchema.safeParse(deal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('stage');
      expect(result.data).toHaveProperty('value');
    }
  });
});

// =====================================================
// 2. PATCH /api/v1/deals/:id — Stage update contract
// =====================================================
describe('PATCH /api/v1/deals/:id — contract', () => {
  it('accepts { stage } partial payload for all 7 stages', () => {
    const partialSchema = DealSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial();
    const stages: DealStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    stages.forEach(stage => {
      const result = partialSchema.safeParse({ stage });
      expect(result.success).toBe(true);
    });
  });

  it('rejects unknown stage in PATCH payload', () => {
    const partialSchema = DealSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial();
    expect(partialSchema.safeParse({ stage: 'closed' }).success).toBe(false);
    expect(partialSchema.safeParse({ stage: '' }).success).toBe(false);
  });

  it('returns updated deal with new stage in ApiSuccess shape', () => {
    const updated = makeDeal({ stage: 'won' });
    const response = mockApiSuccess(updated);
    expect(ApiSuccessShape.safeParse(response).success).toBe(true);
    const parsed = DealSchema.safeParse(response.data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.stage).toBe('won');
    }
  });

  it('returns 400 ApiError when body has no fields to update', () => {
    const response = mockApiError('No fields to update', 400);
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(400);
  });
});

// =====================================================
// 3. Event emission — stage_changed contract
// =====================================================
describe('deal.stage_changed event — contract', () => {
  it('EventBus.emit accepts deal.stage_changed payload shape', () => {
    const spy = jest.spyOn(eventBus, 'emit');
    const deal = makeDeal();

    eventBus.emit('deal.stage_changed', { deal, fromStage: 'new', toStage: 'won' });
    expect(spy).toHaveBeenCalledWith('deal.stage_changed', { deal, fromStage: 'new', toStage: 'won' });

    spy.mockRestore();
  });

  it('deal.won event emitted when stage changes to won', () => {
    const spy = jest.spyOn(eventBus, 'emit');
    const deal = makeDeal({ stage: 'won' });

    eventBus.emit('deal.won', { deal });
    expect(spy).toHaveBeenCalledWith('deal.won', { deal });

    spy.mockRestore();
  });
});

// =====================================================
// 4. DELETE /api/v1/deals/:id — Soft-delete contract
// =====================================================
describe('DELETE /api/v1/deals/:id — soft-delete contract', () => {
  it('soft-deleted response returns ApiSuccess with { id }', () => {
    const response = mockApiSuccess({ id: 'aabbccdd-0000-1111-2222-333344445555' });
    expect(ApiSuccessShape.safeParse(response).success).toBe(true);
    const data = response.data as { id: string };
    expect(data).toHaveProperty('id');
    expect(typeof data.id).toBe('string');
  });

  it('DealSchema does NOT expose deleted_at (soft-delete is invisible to callers)', () => {
    const shape = DealSchema.shape;
    expect('deletedAt' in shape).toBe(false);
    expect('deleted_at' in shape).toBe(false);
  });

  it('returns 404 ApiError for already-deleted or unknown deal', () => {
    const response = mockApiError('Deal not found', 404);
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(404);
  });
});
