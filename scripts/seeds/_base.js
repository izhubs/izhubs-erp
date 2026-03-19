#!/usr/bin/env node
// =============================================================
// izhubs ERP — Seed Base Utilities
// Shared helpers for all industry seed scripts.
// =============================================================

const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

async function upsertUser(client, user, tenantId = '00000000-0000-0000-0000-000000000001') {
  const passwordHash = hashPassword(user.password);
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, role, tenant_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [user.name, user.email, passwordHash, user.role, tenantId]
  );
  if (result.rowCount > 0) return result.rows[0].id;
  const existing = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
  return existing.rows[0].id;
}

async function seedCustomFields(client, ownerId, fields, tenantId = '00000000-0000-0000-0000-000000000001') {
  let inserted = 0;
  for (const f of fields) {
    const res = await client.query(
      `INSERT INTO custom_field_definitions (entity_type, key, label, type, options, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (tenant_id, entity_type, key) DO NOTHING`,
      [f.entity, f.key, f.label, f.type, f.options ? JSON.stringify(f.options) : null, tenantId]
    );
    if (res.rowCount > 0) inserted++;
  }
  return inserted;
}

async function seedContacts(client, ownerId, contacts, tenantId = '00000000-0000-0000-0000-000000000001') {
  const existing = await client.query(
    'SELECT id, email FROM contacts WHERE owner_id = $1 AND tenant_id = $2 AND deleted_at IS NULL ORDER BY created_at ASC',
    [ownerId, tenantId]
  );
  const existingEmails = new Set(existing.rows.map(r => r.email));
  const idMap = Object.fromEntries(existing.rows.map(r => [r.email, r.id]));

  let inserted = 0;
  const ids = [];

  for (const c of contacts) {
    if (existingEmails.has(c.email)) {
      ids.push(idMap[c.email]);
      continue;
    }
    const result = await client.query(
      `INSERT INTO contacts (name, email, phone, title, owner_id, custom_fields, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [c.name, c.email, c.phone || null, c.title || null, ownerId, JSON.stringify(c.custom_fields || {}), tenantId]
    );
    ids.push(result.rows[0].id);
    inserted++;
  }
  return { inserted, ids };
}

async function seedDeals(client, ownerId, contactIds, deals, tenantId = '00000000-0000-0000-0000-000000000001') {
  const existing = await client.query(
    'SELECT name FROM deals WHERE owner_id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
    [ownerId, tenantId]
  );
  const existingNames = new Set(existing.rows.map(r => r.name));
  let inserted = 0;

  for (const d of deals) {
    if (existingNames.has(d.name)) continue;
    const contactId = contactIds[d.contactIdx] ?? null;
    const closedAt = d.closedAt ? new Date(d.closedAt).toISOString() : null;
    await client.query(
      `INSERT INTO deals (name, value, stage, contact_id, owner_id, closed_at, custom_fields, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [d.name, d.value, d.stage, contactId, ownerId, closedAt, JSON.stringify(d.custom_fields || {}), tenantId]
    );
    inserted++;
  }
  return inserted;
}

async function runSeed(industryModule, tenantId = '00000000-0000-0000-0000-000000000001') {
  const client = await pool.connect();
  const { industry, adminUser, customFields, contacts, deals } = industryModule;

  console.log(`\n🌱 izhubs ERP — Seed: ${industry.toUpperCase()} (tenant: ${tenantId.split('-')[0]})\n`);
  try {
    process.stdout.write('  👤 Admin user...');
    const userId = await upsertUser(client, adminUser, tenantId);
    console.log(` ✅ ${adminUser.email}`);

    process.stdout.write('  🏷️  Custom fields...');
    const cfInserted = await seedCustomFields(client, userId, customFields, tenantId);
    console.log(` ✅ ${cfInserted} new`);

    process.stdout.write('  👥 Contacts...');
    const { inserted: cInserted, ids: contactIds } = await seedContacts(client, userId, contacts, tenantId);
    console.log(` ✅ ${cInserted} new (${contacts.length} total)`);

    process.stdout.write('  💼 Deals...');
    const dInserted = await seedDeals(client, userId, contactIds, deals, tenantId);
    console.log(` ✅ ${dInserted} new (${deals.length} total)`);

    console.log(`\n✅ Done: ${contacts.length} contacts, ${deals.length} deals`);
    if (require.main === module) {
      console.log(`\n   Login: ${adminUser.email} / ${adminUser.password}`);
      console.log('   App  : http://localhost:1303\n');
    }
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    if (err.detail) console.error('   Detail:', err.detail);
    if (require.main === module) process.exit(1);
    throw err;
  } finally {
    client.release();
    if (require.main === module) await pool.end();
  }
}

module.exports = { runSeed, hashPassword, upsertUser, seedCustomFields, seedContacts, seedDeals };
