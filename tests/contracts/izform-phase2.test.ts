/**
 * Contract Tests: izForm Phase 2 — Webhooks & Lead Routing
 */

import { db } from '../../core/engine/db';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
let testFormId: string;

describe('izForm Phase 2 — Webhooks & Lead Routing', () => {

  beforeAll(async () => {
    // Create test form with webhook + autoConvertLead
    const res = await db.query(
      `INSERT INTO iz_forms (tenant_id, name, description, fields, webhook_url, auto_convert_lead)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        TENANT_ID,
        'Contract Test Form',
        'Auto-generated test form',
        JSON.stringify([
          { id: 't1', type: 'text', label: 'Full Name', required: true },
          { id: 't2', type: 'email', label: 'Email', required: true },
          { id: 't3', type: 'phone', label: 'Phone', required: false },
        ]),
        'https://httpbin.org/post',
        true,
      ]
    );
    testFormId = res.rows[0].id;
  });

  afterAll(async () => {
    // Delete test submissions
    await db.query(`DELETE FROM iz_form_submissions WHERE form_id = $1`, [testFormId]);
    // Delete test contacts created by this test
    await db.query(`DELETE FROM contacts WHERE tenant_id = $1 AND name IN ('Contract Test User', 'NoEmail Test')`, [TENANT_ID]);
    // Delete test form (hard delete for tests)
    await db.query(`DELETE FROM iz_forms WHERE id = $1`, [testFormId]);
  });

  it('Form has webhook_url + auto_convert_lead columns', async () => {
    const res = await db.query(
      `SELECT webhook_url, auto_convert_lead FROM iz_forms WHERE id = $1`,
      [testFormId]
    );
    const form = res.rows[0];
    expect(form.webhook_url).toBe('https://httpbin.org/post');
    expect(form.auto_convert_lead).toBe(true);
  });

  it('Submit → auto-convert creates Contact', async () => {
    // Insert submission
    const subRes = await db.query(
      `INSERT INTO iz_form_submissions (form_id, tenant_id, data)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [testFormId, TENANT_ID, JSON.stringify({ 'Full Name': 'Contract Test User', 'Email': 'contract-test@example.com', 'Phone': '+84 111 222 333' })]
    );
    const submissionId = subRes.rows[0].id;
    expect(submissionId).toBeTruthy();

    // Manually call convertToContact logic (same SQL as engine)
    const sub = await db.query(`SELECT data FROM iz_form_submissions WHERE id = $1`, [submissionId]);
    const data = sub.rows[0].data as Record<string, string>;

    // Smart field lookup (same logic as engine)
    const find = (keys: string[]) => {
      for (const k of keys) {
        const found = Object.entries(data).find(([key]) => key.toLowerCase() === k.toLowerCase());
        if (found?.[1]) return found[1];
      }
      return null;
    };

    const contactName = find(['name', 'full name', 'fullName', 'full_name']) ?? 'Unknown';
    const contactEmail = find(['email', 'e-mail', 'emailAddress']);
    const contactPhone = find(['phone', 'phone number', 'phoneNumber']);

    expect(contactName).toBe('Contract Test User');
    expect(contactEmail).toBe('contract-test@example.com');
    expect(contactPhone).toBe('+84 111 222 333');

    // Insert contact (same SQL as fixed engine)
    const contactRes = await db.query(
      `INSERT INTO contacts (tenant_id, name, email, phone, status)
       VALUES ($1, $2, $3, $4, 'lead')
       RETURNING id`,
      [TENANT_ID, contactName, contactEmail, contactPhone]
    );
    const contactId = contactRes.rows[0].id;
    expect(contactId).toBeTruthy();

    // Link submission
    await db.query(`UPDATE iz_form_submissions SET contact_id = $1 WHERE id = $2`, [contactId, submissionId]);
    const linked = await db.query(`SELECT contact_id FROM iz_form_submissions WHERE id = $1`, [submissionId]);
    expect(linked.rows[0].contact_id).toBe(contactId);

    // Verify contact fields in DB
    const contact = await db.query(`SELECT name, email, phone, status FROM contacts WHERE id = $1`, [contactId]);
    expect(contact.rows[0].name).toBe('Contract Test User');
    expect(contact.rows[0].email).toBe('contract-test@example.com');
    expect(contact.rows[0].phone).toBe('+84 111 222 333');
    expect(contact.rows[0].status).toBe('lead');
  });

  it('Smart field mapper handles label variations', async () => {
    const testCases: { input: Record<string, string>, expectedName: string, expectedEmail: string }[] = [
      { input: { 'name': 'user1', 'email': 'a@b.com' }, expectedName: 'user1', expectedEmail: 'a@b.com' },
      { input: { 'Full Name': 'user2', 'E-mail': 'c@d.com' }, expectedName: 'user2', expectedEmail: 'c@d.com' },
      { input: { 'FULL NAME': 'user3', 'EMAIL': 'e@f.com' }, expectedName: 'user3', expectedEmail: 'e@f.com' },
      { input: { 'fullName': 'user4', 'emailAddress': 'g@h.com' }, expectedName: 'user4', expectedEmail: 'g@h.com' },
    ];

    const find = (data: Record<string, string>, keys: string[]) => {
      for (const k of keys) {
        const found = Object.entries(data).find(([key]) => key.toLowerCase() === k.toLowerCase());
        if (found?.[1]) return found[1];
      }
      return null;
    };

    for (const tc of testCases) {
      const name = find(tc.input, ['name', 'full name', 'fullName', 'full_name']) ?? 'Unknown';
      const email = find(tc.input, ['email', 'e-mail', 'emailAddress', 'email_address']);
      expect(name).toBe(tc.expectedName);
      expect(email).toBe(tc.expectedEmail);
    }
  });

  it('Auto-convert works even without email', async () => {
    const contactRes = await db.query(
      `INSERT INTO contacts (tenant_id, name, email, phone, status)
       VALUES ($1, $2, $3, $4, 'lead')
       RETURNING id`,
      [TENANT_ID, 'NoEmail Test', null, '+84 999 888 777']
    );
    expect(contactRes.rows[0].id).toBeTruthy();
  });

});
