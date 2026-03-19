#!/usr/bin/env node
// =============================================================
// izhubs ERP — Seed Base Utilities
// Shared helpers for all industry seed scripts.
// v2: supports multi-user seeding (CEO, Sales, Ops, inactive)
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
  const active = user.active !== false; // default true
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, role, tenant_id, active)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO UPDATE SET active = EXCLUDED.active
     RETURNING id`,
    [user.name, user.email, passwordHash, user.role, tenantId, active]
  );
  return result.rows[0].id;
}

/**
 * Seeds multiple users from an array.
 * Returns map: { [email]: userId }
 */
async function seedUsers(client, users, tenantId = '00000000-0000-0000-0000-000000000001') {
  const idMap = {};
  for (const user of users) {
    idMap[user.email] = await upsertUser(client, user, tenantId);
  }
  return idMap;
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
    'SELECT id, email FROM contacts WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC',
    [tenantId]
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
      `INSERT INTO contacts (name, email, phone, title, status, owner_id, custom_fields, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        c.name, c.email, c.phone || null, c.title || null,
        c.status || 'lead', ownerId,
        JSON.stringify(c.custom_fields || {}), tenantId,
      ]
    );
    ids.push(result.rows[0].id);
    inserted++;
  }
  return { inserted, ids };
}

async function seedDeals(client, ownerId, contactIds, deals, tenantId = '00000000-0000-0000-0000-000000000001', ownerMap = null) {
  const existing = await client.query(
    'SELECT name FROM deals WHERE tenant_id = $1 AND deleted_at IS NULL',
    [tenantId]
  );
  const existingNames = new Set(existing.rows.map(r => r.name));
  let inserted = 0;

  for (const d of deals) {
    if (existingNames.has(d.name)) continue;
    const contactId = contactIds[d.contactIdx] ?? null;
    const closedAt = d.closedAt ? new Date(d.closedAt).toISOString() : null;
    // Allow specifying a different owner by email via ownerMap
    const dealOwnerId = (ownerMap && d.ownerEmail && ownerMap[d.ownerEmail]) ? ownerMap[d.ownerEmail] : ownerId;
    await client.query(
      `INSERT INTO deals (name, value, stage, contact_id, owner_id, closed_at, custom_fields, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [d.name, d.value, d.stage, contactId, dealOwnerId, closedAt, JSON.stringify(d.custom_fields || {}), tenantId]
    );
    inserted++;
  }
  return inserted;
}

async function runSeed(industryModule, tenantId = '00000000-0000-0000-0000-000000000001') {
  const client = await pool.connect();
  const { industry, adminUser, users, customFields, contacts, deals } = industryModule;

  console.log(`\n🌱 izhubs ERP — Seed: ${industry.toUpperCase()} (tenant: ${tenantId.split('-')[0]})\n`);
  try {
    // Seed admin user (legacy support)
    process.stdout.write('  👤 Users...');
    let ownerMap = null;
    let adminId;
    if (users && users.length > 0) {
      ownerMap = await seedUsers(client, users, tenantId);
      // CEO/first user is the primary owner
      adminId = Object.values(ownerMap)[0];
      console.log(` ✅ ${users.length} users (${users.filter(u => u.active === false).length} inactive)`);
    } else {
      adminId = await upsertUser(client, adminUser, tenantId);
      console.log(` ✅ ${adminUser.email}`);
    }

    process.stdout.write('  🏷️  Custom fields...');
    const cfInserted = await seedCustomFields(client, adminId, customFields, tenantId);
    console.log(` ✅ ${cfInserted} new`);

    process.stdout.write('  👥 Contacts...');
    const { inserted: cInserted, ids: contactIds } = await seedContacts(client, adminId, contacts, tenantId);
    console.log(` ✅ ${cInserted} new (${contacts.length} total)`);

    process.stdout.write('  💼 Deals...');
    const dInserted = await seedDeals(client, adminId, contactIds, deals, tenantId, ownerMap);
    console.log(` ✅ ${dInserted} new (${deals.length} total)`);

    console.log(`\n✅ Done: ${contacts.length} contacts, ${deals.length} deals`);
    if (require.main === module) {
      const primaryUser = users ? users.find(u => u.active !== false) : adminUser;
      console.log(`\n   Login: ${primaryUser.email} / ${primaryUser.password}`);
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

module.exports = { runSeed, hashPassword, upsertUser, seedUsers, seedCustomFields, seedContacts, seedDeals };
