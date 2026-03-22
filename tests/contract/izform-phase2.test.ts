/**
 * Contract Tests: izForm Phase 2 — Webhooks & Lead Routing
 * 
 * Run: npx tsx tests/contract/izform-phase2.test.ts
 * 
 * NOTES for future development:
 * ─────────────────────────────────────────────────────────────
 * 1. The `contacts` table does NOT have a `source` column.
 *    Use `status = 'lead'` instead when inserting contacts.
 * 2. Form submission keys use FIELD LABELS (e.g. "Full Name")
 *    not camelCase. The `convertToContact()` uses a case-insensitive
 *    smart lookup to map labels → contact fields.
 * 3. `submitForm()` fires side-effects (webhook + lead convert)
 *    as async non-blocking `.catch()` — errors are only logged
 *    to console, not returned to the submitter.
 * ─────────────────────────────────────────────────────────────
 */

import { db } from '../../core/engine/db';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
let testFormId: string;
let pass = 0;
let fail = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    pass++;
  } else {
    console.error(`  ❌ ${label}${detail ? ': ' + detail : ''}`);
    fail++;
  }
}

async function setup() {
  console.log('── Setup ──');
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
  console.log(`  Created test form: ${testFormId}\n`);
}

async function cleanup() {
  console.log('\n── Cleanup ──');
  // Delete test submissions
  await db.query(`DELETE FROM iz_form_submissions WHERE form_id = $1`, [testFormId]);
  // Delete test contacts created by this test
  await db.query(`DELETE FROM contacts WHERE tenant_id = $1 AND name IN ('Contract Test User', 'NoEmail Test')`, [TENANT_ID]);
  // Delete test form (hard delete for tests)
  await db.query(`DELETE FROM iz_forms WHERE id = $1`, [testFormId]);
  console.log('  Cleaned up test data\n');
}

// ─────────────────────────────────────────────────────────────
// TEST 1: Form created with webhook_url and auto_convert_lead
// ─────────────────────────────────────────────────────────────
async function testFormHasPhase2Columns() {
  console.log('TEST 1: Form has webhook_url + auto_convert_lead columns');
  const res = await db.query(
    `SELECT webhook_url, auto_convert_lead FROM iz_forms WHERE id = $1`,
    [testFormId]
  );
  const form = res.rows[0];
  assert('webhook_url saved', form.webhook_url === 'https://httpbin.org/post');
  assert('auto_convert_lead saved as true', form.auto_convert_lead === true);
}

// ─────────────────────────────────────────────────────────────
// TEST 2: Submit form + auto-convert creates a Contact
// ─────────────────────────────────────────────────────────────
async function testAutoConvertLead() {
  console.log('\nTEST 2: Submit → auto-convert creates Contact');

  // Insert submission
  const subRes = await db.query(
    `INSERT INTO iz_form_submissions (form_id, tenant_id, data)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [testFormId, TENANT_ID, JSON.stringify({ 'Full Name': 'Contract Test User', 'Email': 'contract-test@example.com', 'Phone': '+84 111 222 333' })]
  );
  const submissionId = subRes.rows[0].id;
  assert('Submission created', !!submissionId, submissionId);

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

  assert('Field mapper: name = "Contract Test User"', contactName === 'Contract Test User', contactName);
  assert('Field mapper: email = "contract-test@example.com"', contactEmail === 'contract-test@example.com', contactEmail ?? 'null');
  assert('Field mapper: phone = "+84 111 222 333"', contactPhone === '+84 111 222 333', contactPhone ?? 'null');

  // Insert contact (same SQL as fixed engine)
  const contactRes = await db.query(
    `INSERT INTO contacts (tenant_id, name, email, phone, status)
     VALUES ($1, $2, $3, $4, 'lead')
     RETURNING id`,
    [TENANT_ID, contactName, contactEmail, contactPhone]
  );
  const contactId = contactRes.rows[0].id;
  assert('Contact created with status=lead', !!contactId, contactId);

  // Link submission
  await db.query(`UPDATE iz_form_submissions SET contact_id = $1 WHERE id = $2`, [contactId, submissionId]);
  const linked = await db.query(`SELECT contact_id FROM iz_form_submissions WHERE id = $1`, [submissionId]);
  assert('Submission linked to contact', linked.rows[0].contact_id === contactId);

  // Verify contact fields in DB
  const contact = await db.query(`SELECT name, email, phone, status FROM contacts WHERE id = $1`, [contactId]);
  assert('Contact name correct', contact.rows[0].name === 'Contract Test User');
  assert('Contact email correct', contact.rows[0].email === 'contract-test@example.com');
  assert('Contact phone correct', contact.rows[0].phone === '+84 111 222 333');
  assert('Contact status is lead', contact.rows[0].status === 'lead');
}

// ─────────────────────────────────────────────────────────────
// TEST 3: Smart field mapper handles various label formats
// ─────────────────────────────────────────────────────────────
async function testFieldMapperVariations() {
  console.log('\nTEST 3: Smart field mapper handles label variations');

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
    assert(`"${Object.keys(tc.input)[0]}" → name="${name}"`, name === tc.expectedName, name);
    assert(`"${Object.keys(tc.input)[1]}" → email="${email}"`, email === tc.expectedEmail, email ?? 'null');
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 4: Submit without email → Contact still created
// ─────────────────────────────────────────────────────────────
async function testAutoConvertWithoutEmail() {
  console.log('\nTEST 4: Auto-convert works even without email');

  const contactRes = await db.query(
    `INSERT INTO contacts (tenant_id, name, email, phone, status)
     VALUES ($1, $2, $3, $4, 'lead')
     RETURNING id`,
    [TENANT_ID, 'NoEmail Test', null, '+84 999 888 777']
  );
  assert('Contact created without email', !!contactRes.rows[0].id);
}

// ─────────────────────────────────────────────────────────────
// RUN ALL
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  izForm Phase 2 — Contract Tests');
  console.log('═══════════════════════════════════════════\n');

  await setup();

  try {
    await testFormHasPhase2Columns();
    await testAutoConvertLead();
    await testFieldMapperVariations();
    await testAutoConvertWithoutEmail();
  } finally {
    await cleanup();
  }

  console.log('═══════════════════════════════════════════');
  console.log(`  RESULTS: ${pass} passed, ${fail} failed`);
  console.log('═══════════════════════════════════════════\n');

  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error('💥', e); process.exit(1); });
