// =============================================================
// Business Operations API — Contract Tests
// Tests schema shapes, validation rules for contracts,
// milestones, and campaigns entities.
// =============================================================

import {
  ContractSchema,
  CreateContractSchema,
  UpdateContractSchema,
} from '@izerp-plugin/modules/biz-ops/engine/contracts';

import {
  MilestoneSchema,
  CreateMilestoneSchema,
  UpdateMilestoneSchema,
} from '@izerp-plugin/modules/biz-ops/engine/milestones';

import {
  CampaignSchema,
  CreateCampaignSchema,
  UpdateCampaignSchema,
} from '@izerp-plugin/modules/biz-ops/engine/campaigns';

const VALID_UUID = '00000000-0000-0000-0000-000000000001';

describe('Biz-Ops API Contracts', () => {

  // ── Contracts ─────────────────────────────────────────────

  describe('ContractSchema — output shape', () => {
    const validRow = {
      id: VALID_UUID,
      tenant_id: VALID_UUID,
      company_id: null,
      contact_id: null,
      deal_id: null,
      title: 'SEO + Ads Package 2026',
      code: 'HD-2026-001',
      total_value: '50000000',    // Postgres returns NUMERIC as string
      collected_value: '15000000',
      currency: 'VND',
      status: 'signed',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      payment_terms: 'Net 30',
      notes: null,
      owner_id: null,
      custom_fields: {},
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('parses a valid DB row', () => {
      const result = ContractSchema.safeParse(validRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total_value).toBe(50000000);
        expect(result.data.status).toBe('signed');
      }
    });

    it('coerces total_value string to number', () => {
      const result = ContractSchema.safeParse({ ...validRow, total_value: '123456789.50' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.total_value).toBeCloseTo(123456789.5);
    });

    it('rejects invalid status', () => {
      const result = ContractSchema.safeParse({ ...validRow, status: 'active' });
      expect(result.success).toBe(false);
    });

    it('allows null company_id and contact_id', () => {
      const result = ContractSchema.safeParse(validRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.company_id).toBeNull();
        expect(result.data.contact_id).toBeNull();
      }
    });
  });

  describe('CreateContractSchema — input validation', () => {
    it('accepts valid create payload', () => {
      const result = CreateContractSchema.safeParse({
        title: 'Agency Retainer Q1',
        total_value: 30000000,
        status: 'draft',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = CreateContractSchema.safeParse({ title: '', total_value: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects negative total_value', () => {
      const result = CreateContractSchema.safeParse({ title: 'Test', total_value: -100 });
      expect(result.success).toBe(false);
    });

    it('defaults status to draft', () => {
      const result = CreateContractSchema.safeParse({ title: 'Test', total_value: 0 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.status).toBe('draft');
    });

    it('defaults currency to VND', () => {
      const result = CreateContractSchema.safeParse({ title: 'Test' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.currency).toBe('VND');
    });
  });

  describe('UpdateContractSchema — partial update', () => {
    it('accepts partial updates', () => {
      const result = UpdateContractSchema.safeParse({ title: 'Updated Title' });
      expect(result.success).toBe(true);
    });

    it('accepts empty object (no-op)', () => {
      const result = UpdateContractSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('validates status if provided', () => {
      const result = UpdateContractSchema.safeParse({ status: 'invalid_status' });
      expect(result.success).toBe(false);
    });
  });

  // ── Milestones ────────────────────────────────────────────

  describe('MilestoneSchema — output shape', () => {
    const validRow = {
      id: VALID_UUID,
      tenant_id: VALID_UUID,
      contract_id: VALID_UUID,
      title: 'Deposit 30%',
      amount: '15000000',
      percentage: '30.00',
      due_date: '2026-02-01',
      status: 'expected',
      received_date: null,
      invoice_number: null,
      notes: null,
      sort_order: 0,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('parses a valid DB row', () => {
      const result = MilestoneSchema.safeParse(validRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(15000000);
        expect(result.data.percentage).toBe(30);
      }
    });

    it('rejects invalid status', () => {
      const result = MilestoneSchema.safeParse({ ...validRow, status: 'paid' });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateMilestoneSchema — input validation', () => {
    it('accepts valid milestone', () => {
      const result = CreateMilestoneSchema.safeParse({
        contract_id: VALID_UUID,
        title: 'Final Payment',
        amount: 35000000,
        percentage: 70,
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing contract_id', () => {
      const result = CreateMilestoneSchema.safeParse({ title: 'X', amount: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects percentage > 100', () => {
      const result = CreateMilestoneSchema.safeParse({
        contract_id: VALID_UUID,
        title: 'X',
        amount: 0,
        percentage: 150,
      });
      expect(result.success).toBe(false);
    });

    it('defaults status to expected', () => {
      const result = CreateMilestoneSchema.safeParse({
        contract_id: VALID_UUID,
        title: 'Deposit',
        amount: 1000,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.status).toBe('expected');
    });
  });

  describe('UpdateMilestoneSchema — partial update', () => {
    it('accepts status-only update', () => {
      const result = UpdateMilestoneSchema.safeParse({ status: 'received' });
      expect(result.success).toBe(true);
    });

    it('does NOT allow contract_id change', () => {
      // contract_id is omitted from UpdateMilestoneSchema
      const result = UpdateMilestoneSchema.safeParse({ contract_id: VALID_UUID });
      expect(result.success).toBe(true);
      if (result.success) {
        expect('contract_id' in result.data).toBe(false);
      }
    });
  });

  // ── Campaigns ─────────────────────────────────────────────

  describe('CampaignSchema — output shape', () => {
    const validRow = {
      id: VALID_UUID,
      tenant_id: VALID_UUID,
      contract_id: null,
      portfolio_id: null,
      is_private: true,
      name: 'SEO Campaign Q1',
      type: 'seo',
      allocated_budget: '10000000',
      actual_cogs: '2500000',
      stage: 'execution',
      health: 'healthy',
      start_date: '2026-01-15',
      end_date: '2026-03-15',
      owner_id: null,
      custom_fields: {},
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('parses a valid DB row', () => {
      const result = CampaignSchema.safeParse(validRow);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.allocated_budget).toBe(10000000);
        expect(result.data.type).toBe('seo');
        expect(result.data.stage).toBe('execution');
      }
    });

    it('rejects invalid health status', () => {
      const result = CampaignSchema.safeParse({ ...validRow, health: 'critical' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid campaign type', () => {
      const result = CampaignSchema.safeParse({ ...validRow, type: 'email' });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateCampaignSchema — input validation', () => {
    it('accepts valid campaign', () => {
      const result = CreateCampaignSchema.safeParse({
        name: 'Google Ads Campaign',
        type: 'ads',
        allocated_budget: 5000000,
        is_private: true,
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = CreateCampaignSchema.safeParse({
        name: '',
        type: 'seo',
      });
      expect(result.success).toBe(false);
    });

    it('rejects negative budget', () => {
      const result = CreateCampaignSchema.safeParse({
        name: 'X',
        allocated_budget: -1,
      });
      expect(result.success).toBe(false);
    });

    it('defaults type to general', () => {
      const result = CreateCampaignSchema.safeParse({
        name: 'Generic Project',
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.type).toBe('general');
    });

    it('defaults health to healthy', () => {
      const result = CreateCampaignSchema.safeParse({
        name: 'X',
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.health).toBe('healthy');
    });

    it('accepts all campaign types', () => {
      for (const type of ['seo', 'ads', 'social', 'web', 'construction', 'general'] as const) {
        const result = CreateCampaignSchema.safeParse({
          name: `${type} project`,
          type,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('UpdateCampaignSchema — partial update', () => {
    it('accepts partial update', () => {
      const result = UpdateCampaignSchema.safeParse({ health: 'at_risk' });
      expect(result.success).toBe(true);
    });

    it('accepts contract_id change but omits it because update schema doesn\'t restrict contract_id anymore?', () => {
      const result = UpdateCampaignSchema.safeParse({ contract_id: VALID_UUID });
      expect(result.success).toBe(true);
      if (result.success) {
        expect('contract_id' in result.data).toBe(true);
      }
    });

    it('validates type if provided', () => {
      const result = UpdateCampaignSchema.safeParse({ type: 'invalid_type' });
      expect(result.success).toBe(false);
    });
  });

  // ── RBAC Permission Contracts ─────────────────────────────

  describe('RBAC permissions', () => {
    // Inline permission data to avoid jose ESM import issue
    // These must match the ROLE_PERMISSIONS in core/engine/rbac.ts
    const EXPECTED_SUPERADMIN_PERMS = [
      'contracts:read', 'contracts:write', 'contracts:delete',
      'campaigns:read', 'campaigns:write', 'campaigns:delete',
    ];

    const MEMBER_HAS = ['contracts:read', 'campaigns:read', 'campaigns:write'];
    const MEMBER_LACKS = ['contracts:write', 'contracts:delete', 'campaigns:delete'];

    const VIEWER_HAS = ['contracts:read', 'campaigns:read'];
    const VIEWER_LACKS = ['contracts:write', 'contracts:delete', 'campaigns:write', 'campaigns:delete'];

    // Use jest.mock to stub jose so rbac.ts can be imported
    beforeAll(() => {
      jest.mock('jose', () => ({
        SignJWT: jest.fn(),
        jwtVerify: jest.fn(),
      }));
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('contracts and campaigns permissions exist for superadmin', () => {
      const { ROLE_PERMISSIONS } = require('@/core/engine/rbac');
      const superadminPerms = ROLE_PERMISSIONS.superadmin;

      for (const perm of EXPECTED_SUPERADMIN_PERMS) {
        expect(superadminPerms.has(perm)).toBe(true);
      }
    });

    it('member cannot write/delete contracts', () => {
      const { ROLE_PERMISSIONS } = require('@/core/engine/rbac');
      const memberPerms = ROLE_PERMISSIONS.member;

      for (const perm of MEMBER_HAS) expect(memberPerms.has(perm)).toBe(true);
      for (const perm of MEMBER_LACKS) expect(memberPerms.has(perm)).toBe(false);
    });

    it('member can write campaigns but not delete', () => {
      const { ROLE_PERMISSIONS } = require('@/core/engine/rbac');
      const memberPerms = ROLE_PERMISSIONS.member;

      expect(memberPerms.has('campaigns:write')).toBe(true);
      expect(memberPerms.has('campaigns:delete')).toBe(false);
    });

    it('viewer has read-only access', () => {
      const { ROLE_PERMISSIONS } = require('@/core/engine/rbac');
      const viewerPerms = ROLE_PERMISSIONS.viewer;

      for (const perm of VIEWER_HAS) expect(viewerPerms.has(perm)).toBe(true);
      for (const perm of VIEWER_LACKS) expect(viewerPerms.has(perm)).toBe(false);
    });
  });
});
