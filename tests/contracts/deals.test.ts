import { DealSchema } from '@/core/schema/entities';

describe('Deals API Contracts', () => {
  describe('Deal Schema Validation', () => {
    it('should validate a correct deal creation payload', () => {
      const validPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Enterprise License',
        value: 15000,
        stage: 'negotiation',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = DealSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject a deal with invalid stage', () => {
      const invalidPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Enterprise License',
        value: 15000,
        stage: 'not-a-real-stage',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = DealSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});
