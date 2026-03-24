import { db } from '@/core/engine/db';
import { createContract } from '@izerp-plugin/modules/biz-ops/engine/contracts';
import { createCampaign } from '@izerp-plugin/modules/biz-ops/engine/campaigns';
import { createExpense } from '@izerp-plugin/modules/biz-ops/engine/expenses';
import { createPayment } from '@izerp-plugin/modules/biz-ops/engine/payments';

describe('Biz-Ops Financial Tracking & COGS (Phase 1.2)', () => {
  let tenantId: string;
  let contractId: string;
  let campaignId: string;

  beforeAll(async () => {
    // 1. Setup Tenant
    const tRes = await db.query(`INSERT INTO tenants (name, slug, industry) VALUES ('Finance Test Tenant', 'finance-test', 'agency') RETURNING id`);
    tenantId = tRes.rows[0].id;

    // 2. Setup Contract
    const contract = await createContract(tenantId, {
      title: 'Test Contract FY26',
      status: 'in_progress',
      total_value: 10000,
      currency: 'VND',
    });
    contractId = contract.id;

    // 3. Setup Campaign
    const campaign = await createCampaign(tenantId, {
      contract_id: contractId,
      name: 'Q1 Marketing Campaign',
      type: 'general',
      stage: 'planning',
      health: 'healthy',
      allocated_budget: 5000,
    });
    campaignId = campaign.id;
  });

  afterAll(async () => {
    // Teardown
    await db.query(`DELETE FROM tenants WHERE id = $1`, [tenantId]);
  });

  describe('Postgres Triggers: Expense Records -> actual_cogs', () => {
    it('should correctly sum paid expenses into actual_cogs', async () => {
      // 1. Add pending expense (should not roll up)
      const e1 = await createExpense(tenantId, {
        campaign_id: campaignId,
        amount: 500,
        status: 'pending',
        category: 'general',
      });

      let camp = await db.query(`SELECT actual_cogs FROM campaigns WHERE id = $1`, [campaignId]);
      expect(Number(camp.rows[0].actual_cogs)).toBe(0); // Still 0 because pending

      // 2. Add paid expense (should roll up)
      const e2 = await createExpense(tenantId, {
        campaign_id: campaignId,
        amount: 1500,
        status: 'paid',
        category: 'general',
      });

      camp = await db.query(`SELECT actual_cogs FROM campaigns WHERE id = $1`, [campaignId]);
      expect(Number(camp.rows[0].actual_cogs)).toBe(1500); // 0 + 1500 = 1500

      // 3. Update pending to paid (should roll up)
      await db.query(`UPDATE expense_records SET status = 'paid' WHERE id = $1`, [e1.id]);

      camp = await db.query(`SELECT actual_cogs FROM campaigns WHERE id = $1`, [campaignId]);
      expect(Number(camp.rows[0].actual_cogs)).toBe(2000); // 1500 + 500 = 2000

      // 4. Delete an expense (should reduce roll up)
      await db.query(`UPDATE expense_records SET deleted_at = NOW() WHERE id = $1`, [e2.id]);

      camp = await db.query(`SELECT actual_cogs FROM campaigns WHERE id = $1`, [campaignId]);
      expect(Number(camp.rows[0].actual_cogs)).toBe(500); // 2000 - 1500 = 500
    });
  });

  describe('Postgres Triggers: Payment Records -> collected_value', () => {
    it('should correctly sum paid payments into collected_value', async () => {
      // 1. Add pending payment (should not roll up)
      const p1 = await createPayment(tenantId, {
        contract_id: contractId,
        amount: 1000,
        status: 'pending',
      });

      let cont = await db.query(`SELECT collected_value FROM contracts WHERE id = $1`, [contractId]);
      expect(Number(cont.rows[0].collected_value)).toBe(0);

      // 2. Add paid payment (should roll up)
      const p2 = await createPayment(tenantId, {
        contract_id: contractId,
        amount: 3000,
        status: 'paid',
      });

      cont = await db.query(`SELECT collected_value FROM contracts WHERE id = $1`, [contractId]);
      expect(Number(cont.rows[0].collected_value)).toBe(3000);

      // 3. Update pending to paid
      await db.query(`UPDATE payment_records SET status = 'paid' WHERE id = $1`, [p1.id]);
      
      cont = await db.query(`SELECT collected_value FROM contracts WHERE id = $1`, [contractId]);
      expect(Number(cont.rows[0].collected_value)).toBe(4000);

      // 4. Delete a payment (should reduce roll up)
      await db.query(`UPDATE payment_records SET deleted_at = NOW() WHERE id = $1`, [p2.id]);
      
      cont = await db.query(`SELECT collected_value FROM contracts WHERE id = $1`, [contractId]);
      expect(Number(cont.rows[0].collected_value)).toBe(1000);
    });
  });
});
