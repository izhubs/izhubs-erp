import { CreateCampaignSchema, UpdateCampaignSchema } from '@/modules/biz-ops/engine/campaigns';

describe('Biz-Ops Campaigns Engine', () => {

  const dummyContractId = 'd32c96c4-b81b-4f46-95ff-f9dd1240e84d';

  describe('CreateCampaignSchema Validation', () => {
    it('should validate a correct campaign payload', () => {
      const payload = {
        name: 'Chiến dịch Q3',
        contract_id: dummyContractId,
        type: 'web',
        allocated_budget: 10000000,
        expected_revenue: 50000000,
        start_date: '2026-07-01T00:00:00.000Z',
      };
      const result = CreateCampaignSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Chiến dịch Q3');
        expect(result.data.stage).toBe('planning'); // default value
        expect(result.data.health).toBe('healthy'); // default value
      }
    });

    it('should reject when contract_id is missing', () => {
      const payload = { type: 'web', name: 'Valid name' };
      const result = CreateCampaignSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('contract_id');
      }
    });

    it('should assign reasonable defaults for optional fields', () => {
      const payload = { name: 'Dự án tinh gọn', contract_id: dummyContractId, type: 'general' };
      const result = CreateCampaignSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.allocated_budget).toBe(0);
        expect(result.data.stage).toBe('planning');
      }
    });
  });

  describe('UpdateCampaignSchema Validation', () => {
    it('should allow partial updates (e.g., stage only)', () => {
      const payload = { stage: 'in_progress' };
      const result = UpdateCampaignSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.stage).toBe('in_progress');
        expect(result.data.name).toBeUndefined();
      }
    });

    it('should validate health enum correctly', () => {
      const validPayload = { health: 'at_risk' };
      expect(UpdateCampaignSchema.safeParse(validPayload).success).toBe(true);

      const invalidPayload = { health: 'invalid_status' };
      expect(UpdateCampaignSchema.safeParse(invalidPayload).success).toBe(false);
    });
  });

});
