import { NextRequest } from 'next/server';
import { POST as provisionRoute } from '../../app/api/v1/tenant/provision/route';
import { DELETE as resetRoute } from '../../app/api/v1/tenant/reset-demo-data/route';

jest.mock('../../core/engine/rbac', () => ({
  withPermission: jest.fn((perm, handler) => async (req: NextRequest) => {
    // Mock a valid admin claims object
    const mockClaims = { sub: 'user-1', role: 'admin', email: 'admin@test.com', type: 'access' };
    return handler(req, mockClaims);
  }),
}));

jest.mock('../../core/engine/tenant', () => ({
  provisionTenant: jest.fn().mockResolvedValue({ tenantId: 'tenant-123' }),
  resetDemoData: jest.fn().mockResolvedValue({ success: true, count: 50 }),
}));

describe('@qa - API Contract Tests: Tenant Provisioning', () => {
  it('POST /api/v1/tenant/provision - validates payload and provisions', async () => {
    const req = new NextRequest('http://localhost/api/v1/tenant/provision', {
      method: 'POST',
      body: JSON.stringify({ templateId: 'agency', includeDemoData: true }),
    });

    const res = await provisionRoute(req, { params: {} });
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.tenantId).toBe('tenant-123');
  });

  it('DELETE /api/v1/tenant/reset-demo-data - resets demo data for the current tenant', async () => {
    const req = new NextRequest('http://localhost/api/v1/tenant/reset-demo-data', {
      method: 'DELETE',
      headers: { 'x-tenant-id': 'tenant-123' },
    });

    const res = await resetRoute(req, { params: {} });
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
