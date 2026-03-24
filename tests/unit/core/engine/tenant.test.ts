import { provisionTenant, resetDemoData } from '../../../../core/engine/tenant';
import { db } from '../../../../core/engine/db';
import { getTemplate } from '@izerp-theme/templates';

jest.mock('../../../../core/engine/db', () => ({
  db: {
    query: jest.fn(),
    queryAsTenant: jest.fn(),
    withTransaction: jest.fn((callback) => callback()),
    withTenantTransaction: jest.fn((id, callback) => callback()),
  },
}));

jest.mock('../../../../templates', () => ({
  getTemplate: jest.fn(),
}));

describe('@qa - Unit Tests: core/engine/tenant.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('provisionTenant', () => {
    it('should throw Error if template is not found', async () => {
      (getTemplate as jest.Mock).mockReturnValue(undefined);
      await expect(provisionTenant('user-1', { templateId: 'invalid' })).rejects.toThrow('Template invalid not found');
    });

    it('should create tenant, seed structure, and link user when includeDemoData is false', async () => {
      const mockTemplate = {
        id: 'agency',
        stages: [{ id: 'lead', name: 'Lead' }],
        customFields: [{ key: 'project', type: 'text' }],
      };
      (getTemplate as jest.Mock).mockReturnValue(mockTemplate);
      
      const mockTenantId = 'tenant-xyz';
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [{ id: mockTenantId }] }); // insert tenant
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // update user tenant_id

      const result = await provisionTenant('user-1', { templateId: 'agency', includeDemoData: false });
      
      expect(result.tenantId).toBe(mockTenantId);
      expect(db.withTransaction).toHaveBeenCalled();
    });
  });

  describe('resetDemoData', () => {
    it('should call db.queryAsTenant to soft delete records marked as demo=true', async () => {
      (db.queryAsTenant as jest.Mock).mockResolvedValue({ rows: [{ id: 1 }] });
      await resetDemoData('tenant-xyz');
      expect(db.queryAsTenant).toHaveBeenCalledWith(
        'tenant-xyz',
        expect.stringContaining('UPDATE')
      );
    });
  });
});
