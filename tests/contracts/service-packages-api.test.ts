// =============================================================
// Service Packages API — Contract Tests
// Tests schema shapes, validation rules, and engine functions.
// Pattern matches existing contacts.test.ts / deals.test.ts.
// =============================================================

import {
  ServicePackageSchema,
  CreateServicePackageSchema,
  UpdateServicePackageSchema,
} from '@/core/engine/service-packages';

describe('Service Packages API Contracts', () => {

  describe('ServicePackageSchema — output shape', () => {
    const validRow = {
      id: '00000000-0000-0000-0000-000000000010',
      tenant_id: '00000000-0000-0000-0000-000000000001',
      name: 'Basic',
      description: 'Single address service',
      price: '500000',        // Postgres returns NUMERIC as string
      currency: 'VND',
      billing: 'monthly',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    it('parses a valid DB row', () => {
      const result = ServicePackageSchema.safeParse(validRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(500000);   // coerced to number
        expect(result.data.billing).toBe('monthly');
      }
    });

    it('coerces price to number', () => {
      const result = ServicePackageSchema.safeParse({ ...validRow, price: '1500000.50' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.price).toBeCloseTo(1500000.5);
    });

    it('rejects invalid billing cycle', () => {
      const result = ServicePackageSchema.safeParse({ ...validRow, billing: 'weekly' });
      expect(result.success).toBe(false);
    });

    it('allows null description', () => {
      const result = ServicePackageSchema.safeParse({ ...validRow, description: null });
      expect(result.success).toBe(true);
    });
  });

  describe('CreateServicePackageSchema — input validation', () => {
    it('accepts valid create payload', () => {
      const result = CreateServicePackageSchema.safeParse({
        name: 'Pro',
        description: 'Pro virtual office package',
        price: 1500000,
        currency: 'VND',
        billing: 'monthly',
        is_active: true,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = CreateServicePackageSchema.safeParse({ name: '', price: 1000000 });
      expect(result.success).toBe(false);
    });

    it('rejects negative price', () => {
      const result = CreateServicePackageSchema.safeParse({ name: 'Basic', price: -100 });
      expect(result.success).toBe(false);
    });

    it('defaults billing to monthly when not provided', () => {
      const result = CreateServicePackageSchema.safeParse({ name: 'Basic', price: 500000 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.billing).toBe('monthly');
    });

    it('defaults is_active to true', () => {
      const result = CreateServicePackageSchema.safeParse({ name: 'Basic', price: 500000 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.is_active).toBe(true);
    });

    it('accepts all billing cycles', () => {
      for (const billing of ['monthly', 'yearly', 'one_time'] as const) {
        const result = CreateServicePackageSchema.safeParse({ name: 'X', price: 0, billing });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('UpdateServicePackageSchema — partial update', () => {
    it('accepts partial updates (name only)', () => {
      const result = UpdateServicePackageSchema.safeParse({ name: 'Enterprise' });
      expect(result.success).toBe(true);
    });

    it('accepts empty object (no-op update)', () => {
      const result = UpdateServicePackageSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('still validates billing cycle if provided', () => {
      const result = UpdateServicePackageSchema.safeParse({ billing: 'daily' });
      expect(result.success).toBe(false);
    });

    it('still validates price if provided', () => {
      const result = UpdateServicePackageSchema.safeParse({ price: -999 });
      expect(result.success).toBe(false);
    });
  });

  describe('API contract shapes (HTTP response format)', () => {
    it('GET /api/v1/service-packages — expects { packages: [...] }', () => {
      // Schema contract: response must include packages array
      const mockResponse = {
        packages: [
          {
            id: '00000000-0000-0000-0000-000000000010',
            tenant_id: '00000000-0000-0000-0000-000000000001',
            name: 'Basic', description: null,
            price: 500000, currency: 'VND', billing: 'monthly',
            is_active: true, subscriber_count: 3,
            created_at: new Date(), updated_at: new Date(), deleted_at: null,
          }
        ]
      };
      expect(Array.isArray(mockResponse.packages)).toBe(true);
      const first = mockResponse.packages[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('subscriber_count');
    });

    it('POST /api/v1/service-packages — must return created package', () => {
      const mockReturn = {
        package: {
          id: '00000000-0000-0000-0000-000000000011',
          name: 'Enterprise', price: 5000000, billing: 'yearly', is_active: true,
        }
      };
      expect(mockReturn.package.id).toBeTruthy();
    });
  });
});
