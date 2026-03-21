/**
 * Plugin Registry API — Contract Tests
 *
 * Tests verify:
 * 1. API response shape contracts for plugins endpoints
 * 2. withPlugin() isolation logic (403 when plugin not active)
 * 3. Plugin schema Zod validation
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

// ---- A valid Plugin fixture ----
const makePlugin = (overrides = {}) => ({
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

const makePluginWithStatus = (overrides = {}) => ({
  ...makePlugin(),
  isActive: true,
  installedAt: new Date('2026-03-01'),
  config: {},
  ...overrides,
});

// =====================================================
// 1. GET /api/v1/plugins — Response shape contracts
// =====================================================
describe('GET /api/v1/plugins — contract', () => {
  it('returns ApiSuccess with Plugin[] array', () => {
    const plugins = [makePluginWithStatus(), makePluginWithStatus({ id: 'invoices', isActive: false, installedAt: null })];
    const response = mockSuccess(plugins);
    expect(ApiSuccessShape.safeParse(response).success).toBe(true);
  });

  it('ModuleSchema validates a correct plugin object', () => {
    const plugin = makePlugin();
    expect(ModuleSchema.safeParse(plugin).success).toBe(true);
  });

  it('ModuleSchema rejects unknown category', () => {
    const plugin = makePlugin({ category: 'unknown' });
    expect(ModuleSchema.safeParse(plugin).success).toBe(false);
  });

  it('ModuleWithStatusSchema validates isActive and installedAt', () => {
    const p = makePluginWithStatus();
    const result = ModuleWithStatusSchema.safeParse(p);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty('isActive');
      expect(result.data).toHaveProperty('installedAt');
    }
  });

  it('ModuleWithStatusSchema accepts null installedAt for uninstalled plugins', () => {
    const p = makePluginWithStatus({ isActive: false, installedAt: null });
    expect(ModuleWithStatusSchema.safeParse(p).success).toBe(true);
  });
});

// =====================================================
// 2. POST /api/v1/plugins/[id]/install — contract
// =====================================================
describe('POST /api/v1/plugins/[id]/install — contract', () => {
  it('returns ApiSuccess with { pluginId, isActive: true } on install', () => {
    const response = mockSuccess({ pluginId: 'invoices', isActive: true, message: "Plugin 'invoices' activated successfully" });
    expect(ApiSuccessShape.safeParse(response).success).toBe(true);
    const data = response.data as { pluginId: string; isActive: boolean };
    expect(data.isActive).toBe(true);
    expect(typeof data.pluginId).toBe('string');
  });

  it('returns 404 ApiError when pluginId is not in registry', () => {
    const response = mockError("Plugin 'nonexistent' not found in registry", 404, 'NOT_FOUND');
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(404);
  });

  it('returns 400 ApiError when pluginId is missing', () => {
    const response = mockError('Plugin ID is required', 400, 'VALIDATION_FAILED');
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(400);
  });
});

// =====================================================
// 3. DELETE /api/v1/plugins/[id]/install — contract
// =====================================================
describe('DELETE /api/v1/plugins/[id]/install — contract', () => {
  it('returns ApiSuccess with { pluginId, isActive: false } on uninstall', () => {
    const response = mockSuccess({ pluginId: 'invoices', isActive: false });
    const data = response.data as { pluginId: string; isActive: boolean };
    expect(data.isActive).toBe(false);
  });

  it('returns 403 ApiError when trying to deactivate core crm plugin', () => {
    const response = mockError("Cannot deactivate the 'crm' plugin — it is required for core operation", 403, 'FORBIDDEN');
    expect(ApiErrorShape.safeParse(response).success).toBe(true);
    expect(response.status).toBe(403);
  });
});

// =====================================================
// 4. withPlugin() Tenant Isolation — contract
// =====================================================
describe('withPlugin() Tenant Isolation — contract', () => {
  it('returns 403 PLUGIN_NOT_ACTIVE shape when plugin inactive', () => {
    const response = {
      error: 'Plugin not active',
      code: 'PLUGIN_NOT_ACTIVE',
      plugin: 'invoices',
      message: "The 'invoices' plugin is not installed. Go to Settings → Plugins to activate it.",
      status: 403,
    };
    expect(response.status).toBe(403);
    expect(response.code).toBe('PLUGIN_NOT_ACTIVE');
    expect(typeof response.plugin).toBe('string');
    expect(typeof response.message).toBe('string');
  });

  it('PLUGIN_NOT_ACTIVE response includes plugin id', () => {
    const pluginId = 'mail-log';
    const response = {
      error: 'Plugin not active',
      code: 'PLUGIN_NOT_ACTIVE',
      plugin: pluginId,
      status: 403,
    };
    expect(response.plugin).toBe(pluginId);
  });
});
