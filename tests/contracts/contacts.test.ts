import { ContactSchema } from '@/core/schema/entities';

// Since we don't have a reliable in-memory DB or test DB setup yet,
// we will verify that the schema exports and definitions match our expectations
// for the HTTP contract we intend to fulfill.
describe('Contacts API Contracts', () => {
  describe('Contact Schema Validation', () => {
    it('should validate a correct contact creation payload', () => {
      const validPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1234567890',
        title: 'CEO',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = ContactSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject a contact without a name', () => {
      const invalidPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'jane@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = ContactSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email formats', () => {
      const invalidPayload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Jane Doe',
        email: 'not-an-email',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = ContactSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});
