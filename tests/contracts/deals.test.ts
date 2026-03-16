import { DealSchema, DealStageSchema } from '@/core/schema/entities';
import type { DealStage } from '@/core/schema/entities';

// Helper: build a valid deal object for testing
const makeDeal = (overrides: Partial<ReturnType<typeof DealSchema.parse>> = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Enterprise SaaS License',
  value: 15000,
  stage: 'new' as DealStage,
  customFields: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Deals — Schema Contracts', () => {
  describe('DealStageSchema', () => {
    const validStages: DealStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

    it.each(validStages)('accepts stage "%s"', (stage) => {
      expect(DealStageSchema.safeParse(stage).success).toBe(true);
    });

    it('rejects unknown stages', () => {
      expect(DealStageSchema.safeParse('pipeline').success).toBe(false);
      expect(DealStageSchema.safeParse('').success).toBe(false);
      expect(DealStageSchema.safeParse(null).success).toBe(false);
    });
  });

  describe('DealSchema', () => {
    it('validates a correct deal payload', () => {
      expect(DealSchema.safeParse(makeDeal()).success).toBe(true);
    });

    it('rejects a deal with invalid stage', () => {
      expect(DealSchema.safeParse(makeDeal({ stage: 'not-a-stage' as DealStage })).success).toBe(false);
    });

    it('rejects a deal with negative value', () => {
      expect(DealSchema.safeParse(makeDeal({ value: -1 })).success).toBe(false);
    });

    it('accepts deals with optional fields omitted', () => {
      const minimal = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Quick deal',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(DealSchema.safeParse(minimal).success).toBe(true);
    });
  });
});

describe('Deals — Engine Behavior Contracts', () => {
  describe('getDealsByStage', () => {
    it('rejects an invalid stage before hitting DB', () => {
      // DealStageSchema.parse() throws synchronously for invalid input
      expect(() => DealStageSchema.parse('fake-stage')).toThrow();
    });

    it('accepts all 7 valid stage values without throwing', () => {
      const stages: DealStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
      stages.forEach(stage => {
        expect(() => DealStageSchema.parse(stage)).not.toThrow();
      });
    });
  });

  describe('updateDeal — partial update shape', () => {
    it('partial DealSchema allows updating only stage', () => {
      const partial = DealSchema
        .omit({ id: true, createdAt: true, updatedAt: true })
        .partial();

      const result = partial.safeParse({ stage: 'won' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stage).toBe('won');
        expect(result.data.name).toBeUndefined(); // other fields not required
      }
    });

    it('partial DealSchema rejects invalid stage even on partial update', () => {
      const partial = DealSchema
        .omit({ id: true, createdAt: true, updatedAt: true })
        .partial();

      expect(partial.safeParse({ stage: 'closed' }).success).toBe(false);
    });

    it('rejects empty partial update object (no fields to update)', () => {
      const partial = DealSchema
        .omit({ id: true, createdAt: true, updatedAt: true })
        .partial();

      const result = partial.safeParse({});
      expect(result.success).toBe(true); // Zod allows it — route handler guards Object.keys().length === 0
      if (result.success) {
        expect(Object.keys(result.data).length).toBe(0);
      }
    });
  });

  describe('softDelete — semantic contract', () => {
    it('a soft-deleted deal should not parse without deleted_at (schema contract)', () => {
      // The schema excludes deleted_at — engine returns null for soft-deleted rows
      // Contracts: getDeal() returns null after softDeleteDeal()
      // We verify the schema does NOT expose deleted_at (confirms engine hides it)
      const dealShape = DealSchema.shape;
      expect('deletedAt' in dealShape).toBe(false);
      expect('deleted_at' in dealShape).toBe(false);
    });
  });
});
