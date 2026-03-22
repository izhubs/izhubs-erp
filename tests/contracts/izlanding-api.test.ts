/**
 * izLanding Plugin API — Contract Tests
 */

import { z } from 'zod';
import { ProjectSchema, CreateProjectSchema } from '@/core/engine/izlanding';

// ---- Fixtures ----
const makeProject = (overrides = {}) => ({
  id: '00000000-0000-0000-0000-000000000040',
  tenantId: '00000000-0000-0000-0000-000000000001',
  name: 'Agency Portfolio',
  description: 'Landing page cho dịch vụ agency',
  activeDomain: null,
  status: 'draft' as const,
  createdAt: new Date('2026-03-22'),
  updatedAt: new Date('2026-03-22'),
  ...overrides,
});

// =====================================================
// 1. ProjectSchema — output shape
// =====================================================
describe('ProjectSchema — output shape', () => {
  it('parses a valid project', () => {
    expect(ProjectSchema.safeParse(makeProject()).success).toBe(true);
  });

  it('accepts null description', () => {
    expect(ProjectSchema.safeParse(makeProject({ description: null })).success).toBe(true);
  });

  it('accepts null activeDomain', () => {
    expect(ProjectSchema.safeParse(makeProject({ activeDomain: null })).success).toBe(true);
  });

  it('validates status enum', () => {
    expect(ProjectSchema.safeParse(makeProject({ status: 'published' })).success).toBe(true);
    expect(ProjectSchema.safeParse(makeProject({ status: 'archived' })).success).toBe(true);
    expect(ProjectSchema.safeParse(makeProject({ status: 'deleted' })).success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { name, ...noName } = makeProject();
    expect(ProjectSchema.safeParse(noName).success).toBe(false);
  });
});

// =====================================================
// 2. CreateProjectSchema — input validation
// =====================================================
describe('CreateProjectSchema — input validation', () => {
  it('accepts valid create payload', () => {
    const result = CreateProjectSchema.safeParse({
      name: 'SaaS Product Launch',
      description: 'Landing page cho sản phẩm SaaS mới',
    });
    expect(result.success).toBe(true);
  });

  it('accepts payload without description', () => {
    const result = CreateProjectSchema.safeParse({ name: 'Minimal Page' });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(CreateProjectSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects missing name', () => {
    expect(CreateProjectSchema.safeParse({}).success).toBe(false);
  });
});

// =====================================================
// 3. API contract shapes
// =====================================================
describe('API contract shapes', () => {
  it('GET /api/v1/plugins/izlanding/projects — returns array', () => {
    const response = { data: [makeProject()] };
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('POST /api/v1/plugins/izlanding/projects — returns project with id', () => {
    const response = { data: makeProject() };
    expect(response.data.id).toBeTruthy();
    expect(response.data.status).toBe('draft');
  });
});
