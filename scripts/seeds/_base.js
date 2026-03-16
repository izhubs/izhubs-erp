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

async function upsertUser(client, user) {
  const passwordHash = hashPassword(user.password);
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [user.name, user.email, passwordHash, user.role]
  );
  if (result.rowCount > 0) return result.rows[0].id;
  const existing = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
  return existing.rows[0].id;
}

async function seedCustomFields(client, ownerId, fields) {
  let inserted = 0;
  for (const f of fields) {
    const res = await client.query(
      `INSERT INTO custom_field_definitions (entity_type, key, label, type, options)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (entity_type, key) DO NOTHING`,
      [f.entity, f.key, f.label, f.type, f.options ? JSON.stringify(f.options) : null]
    );
    if (res.rowCount > 0) inserted++;
  }
  return inserted;
}

async function seedContacts(client, ownerId, contacts) {
  const existing = await client.query(
    'SELECT id, email FROM contacts WHERE owner_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC',
    [ownerId]
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
      `INSERT INTO contacts (name, email, phone, title, owner_id, custom_fields)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [c.name, c.email, c.phone || null, c.title || null, ownerId, JSON.stringify(c.custom_fields || {})]
    );
    ids.push(result.rows[0].id);
    inserted++;
  }
  return { inserted, ids };
}

async function seedDeals(client, ownerId, contactIds, deals) {
  const existing = await client.query(
    'SELECT name FROM deals WHERE owner_id = $1 AND deleted_at IS NULL',
    [ownerId]
  );
  const existingNames = new Set(existing.rows.map(r => r.name));
  let inserted = 0;

  for (const d of deals) {
    if (existingNames.has(d.name)) continue;
    const contactId = contactIds[d.contactIdx] ?? null;
    const closedAt = d.closedAt ? new Date(d.closedAt).toISOString() : null;
    await client.query(
      `INSERT INTO deals (name, value, stage, contact_id, owner_id, closed_at, custom_fields)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [d.name, d.value, d.stage, contactId, ownerId, closedAt, JSON.stringify(d.custom_fields || {})]
    );
    inserted++;
  }
  return inserted;
}

async function runSeed(industryModule) {
  const client = await pool.connect();
  const { industry, adminUser, customFields, contacts, deals } = industryModule;

  console.log(`\n🌱 izhubs ERP — Seed: ${industry.toUpperCase()}\n`);
  try {
    process.stdout.write('  👤 Admin user...');
    const userId = await upsertUser(client, adminUser);
    console.log(` ✅ ${adminUser.email}`);

    process.stdout.write('  🏷️  Custom fields...');
    const cfInserted = await seedCustomFields(client, userId, customFields);
    console.log(` ✅ ${cfInserted} new`);

    process.stdout.write('  👥 Contacts...');
    const { inserted: cInserted, ids: contactIds } = await seedContacts(client, userId, contacts);
    console.log(` ✅ ${cInserted} new (${contacts.length} total)`);

    process.stdout.write('  💼 Deals...');
    const dInserted = await seedDeals(client, userId, contactIds, deals);
    console.log(` ✅ ${dInserted} new (${deals.length} total)`);

    console.log(`\n✅ Done: ${contacts.length} contacts, ${deals.length} deals`);
    console.log(`\n   Login: ${adminUser.email} / ${adminUser.password}`);
    console.log('   App  : http://localhost:1303\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    if (err.detail) console.error('   Detail:', err.detail);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

module.exports = { runSeed, hashPassword };
