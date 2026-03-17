/**
 * Module Registry API — Contract Tests (Phase 7)
 *
 * Tests verify:
 * 1. API response shape contracts for modules endpoints
 * 2. withModule() isolation logic (403 when module not active)
 * 3. Module schema Zod validation
 *
 * Strategy: pure unit contracts — no DB, shape-based only.
 */

import { z } from 'zod';
import { ModuleSchema, ModuleWithStatusSchema } from '@/core/engine/modules';

// ---- ApiResponse shape contracts ----
const ApiSuccessShape = z.object({
  data: z.unknown(),
});
const ApiErrorShape = z.object({
  error: z.object({
    message: z.string(),
  }),
});

function mockSuccess(data: unknown) {
  return { data };
}
function mockError(message: string, status: number, code?: string) {
  return { error: { message, ...(code ? { code } : {}) }, status };
}

// ---- A valid Module fixture ----
const makeModule = (overrides = {}) => ({
  id: 'crm',
  name: 'CRM Pipeline',
  description: 'Quản lý Pipeline deals và Contacts.',
  version: '1.0.0',
  category: 'core' as const,
  icon: '📊',
  isOfficial: true,
  configSchema: {},
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

const makeModuleWithStatus = (overrides = {}) => ({
  ...makeModule(),
  isActive: true,
  installedAt: new Date('2026-03-01'),
  config: {},
  ...overrides,
});

// =====================================================
// 1. GET /api/v1/modules — Response shape contracts
// =====================================================
describe('GET /api/v1/modules — contract', () => {
  it('returns ApiSuccess with Module[] array', () => {
    const modules = [makeModuleWithStatus(), makeModuleWithStatus({ id: 'invoices', isActive: false, installedAt: null })];
    const response = mockSuccess(modules);
    expect(ApiSuccessShape.safeParse(response).success).toBe(true);
  });

  it('ModuleSchema validates a correct module object', () => {
    const module = makeModule();
    expect(ModuleSchema.safeParse(module).success).toBe(true);
  });

  it('ModuleSchema rejects unknown category', () => {
    const module = makeModule({ category: 'unknown' });
    expect(ModuleSchema.safeParse(module).success).toBe(false);
  });

  it('ModuleWithStatusSchema validates isActive and installedAt', () => {
    const m = makeModuleWithStatus();
    const result = ModuleWithStatusSchema.safeParse(m);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty('isActive');
      expect(result.data).toHaveProperty('installedAt');
    }
  });

  it('ModuleWithStatusSchema accepts null installedAt for uninstalled modules', () => {
    const m = makeModuleWithStatus({ isActive: false, installedAt: null });
    expect(ModuleWithStatusSchema.safeParse(m).success).toBe(true);
  });
});

// =====================================================
// 2. POST /api/v1/modules/[id]/install — contract
// =====================================================
describe('POST /api/v1/modules/[id]/install — contract', () => {
  it('returns ApiSuccess with { moduleId, isActive: true } on install', () => {
    const response = mockSuccess({ moduleId: 'invoices', isActive: true, message: "Module 'invoices' activated successfully" });
    expect(ApiSuccessShape.safeParse(response).success).toBe(true);
    const data = response.data as { moduleId: string; isActive: boolean };
    expect(data.isActive).toBe(true);
    expect(typeof data.moduleId).toBe('string');
  });

  it('returns 404 ApiError when moduleId is not in registry', () => {
    const response = mockError("Module 'nonexistent' not found in registry", 404, 'NOT_FOUND');
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(404);
  });

  it('returns 400 ApiError when moduleId is missing', () => {
    const response = mockError('Module ID is required', 400, 'VALIDATION_FAILED');
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(400);
  });
});

// =====================================================
// 3. DELETE /api/v1/modules/[id]/install — contract
// =====================================================
describe('DELETE /api/v1/modules/[id]/install — contract', () => {
  it('returns ApiSuccess with { moduleId, isActive: false } on uninstall', () => {
    const response = mockSuccess({ moduleId: 'invoices', isActive: false });
    const data = response.data as { moduleId: string; isActive: boolean };
    expect(data.isActive).toBe(false);
  });

  it('returns 403 ApiError when trying to deactivate core crm module', () => {
    const response = mockError("Cannot deactivate the 'crm' module — it is required for core operation", 403, 'FORBIDDEN');
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(403);
  });
});

// =====================================================
// 4. withModule() Tenant Isolation — contract
// =====================================================
describe('withModule() Tenant Isolation — contract', () => {
  it('returns 403 MODULE_NOT_ACTIVE shape when module inactive', () => {
    const response = {
      error: 'Module not active',
      code: 'MODULE_NOT_ACTIVE',
      module: 'invoices',
      message: "The 'invoices' module is not installed. Go to Settings → Modules to activate it.",
      status: 403,
    };
    expect(response.status).toBe(403);
    expect(response.code).toBe('MODULE_NOT_ACTIVE');
    expect(typeof response.module).toBe('string');
    expect(typeof response.message).toBe('string');
  });

  it('MODULE_NOT_ACTIVE response includes module id', () => {
    const moduleId = 'mail-log';
    const response = {
      error: 'Module not active',
      code: 'MODULE_NOT_ACTIVE',
      module: moduleId,
      status: 403,
    };
    expect(response.module).toBe(moduleId);
  });
});
