#!/usr/bin/env node
// =============================================================
// izhubs ERP — Demo Data Seed Script
// Seeds 1 admin user + 20 contacts + 15 deals for first-run demos.
//
// Idempotent: uses ON CONFLICT DO NOTHING — safe to run multiple times.
//
// Usage:
//   node scripts/seed-demo.js
//   npm run seed:demo
// =============================================================

const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp',
});

// Simple password hasher matching core/engine/auth.ts implementation (sha256 + salt)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

// ----------------------------------------------------------------
// Data definitions
// ----------------------------------------------------------------

const DEMO_USER = {
  name: 'Isaac Vũ',
  email: 'demo@izhubs.com',
  password: 'Demo@12345',
  role: 'admin',
};

const DEMO_CONTACTS = [
  { name: 'Nguyễn Văn An', email: 'an.nguyen@techviet.vn', phone: '0901234567', title: 'CEO' },
  { name: 'Trần Thị Bình', email: 'binh.tran@startuphub.io', phone: '0912345678', title: 'Co-founder' },
  { name: 'Lê Minh Châu', email: 'chau.le@digitalagency.vn', phone: '0923456789', title: 'Sales Director' },
  { name: 'Phạm Quốc Dũng', email: 'dung.pham@solodev.me', phone: '0934567890', title: 'Freelancer' },
  { name: 'Hoàng Thị Em', email: 'em.hoang@retailco.vn', phone: '0945678901', title: 'Operations Manager' },
  { name: 'Vũ Thanh Hải', email: 'hai.vu@foodchain.vn', phone: '0956789012', title: 'Founder' },
  { name: 'Đặng Ngọc Hương', email: 'huong.dang@ecomshop.vn', phone: '0967890123', title: 'E-commerce Manager' },
  { name: 'Bùi Văn Kiên', email: 'kien.bui@architects.vn', phone: '0978901234', title: 'Principal Architect' },
  { name: 'Ngô Thị Lan', email: 'lan.ngo@mediahouse.vn', phone: '0989012345', title: 'Creative Director' },
  { name: 'Đinh Hữu Minh', email: 'minh.dinh@logistics.vn', phone: '0990123456', title: 'Business Owner' },
  { name: 'Sarah Chen', email: 'sarah.chen@hkventures.hk', phone: '+85298765432', title: 'Investment Manager' },
  { name: 'David Lim', email: 'david.lim@sgtech.sg', phone: '+6591234567', title: 'CTO' },
  { name: 'Lý Thị Ngọc', email: 'ngoc.ly@boutique.vn', phone: '0901122334', title: 'Owner' },
  { name: 'Trương Văn Phong', email: 'phong.truong@manufacture.vn', phone: '0912233445', title: 'Factory Director' },
  { name: 'Phan Minh Quân', email: 'quan.phan@consulting.vn', phone: '0923344556', title: 'Senior Consultant' },
  { name: 'Lưu Thị Sen', email: 'sen.luu@beauty.vn', phone: '0934455667', title: 'Salon Owner' },
  { name: 'Dương Văn Tài', email: 'tai.duong@realestate.vn', phone: '0945566778', title: 'Real Estate Agent' },
  { name: 'Cao Thị Uyên', email: 'uyen.cao@academy.edu.vn', phone: '0956677889', title: 'Education Director' },
  { name: 'Hồ Minh Vũ', email: 'vu.ho@photography.vn', phone: '0967788990', title: 'Photographer / Owner' },
  { name: 'Tô Thị Xuân', email: 'xuan.to@catering.vn', phone: '0978899001', title: 'Catering Business Owner' },
];

// Deal definitions — spread across all 7 stages
// Values in VND (5M to 500M range)
const DEAL_TEMPLATES = [
  // new (2)
  { name: 'Website Redesign Package', value: 25000000, stage: 'new', contactIdx: 0 },
  { name: 'Annual ERP License — Retail', value: 80000000, stage: 'new', contactIdx: 11 },

  // contacted (3)
  { name: 'SEO Retainer Q2', value: 18000000, stage: 'contacted', contactIdx: 2 },
  { name: 'Social Media Management', value: 12000000, stage: 'contacted', contactIdx: 6 },
  { name: 'Logistics Software Integration', value: 150000000, stage: 'contacted', contactIdx: 9 },

  // qualified (3)
  { name: 'Digital Marketing Campaign', value: 45000000, stage: 'qualified', contactIdx: 1 },
  { name: 'Food Chain POS System', value: 95000000, stage: 'qualified', contactIdx: 5 },
  { name: 'Architecture Studio Platform', value: 35000000, stage: 'qualified', contactIdx: 7 },

  // proposal (2)
  { name: 'Hong Kong Market Entry Consulting', value: 320000000, stage: 'proposal', contactIdx: 10 },
  { name: 'Manufacturing ERP Deployment', value: 500000000, stage: 'proposal', contactIdx: 13 },

  // negotiation (2)
  { name: 'Beauty Salon Management System', value: 22000000, stage: 'negotiation', contactIdx: 15 },
  { name: 'Real Estate CRM Customization', value: 68000000, stage: 'negotiation', contactIdx: 16 },

  // won (2) — with closed_at
  { name: 'Academy Learning Platform', value: 140000000, stage: 'won', contactIdx: 17, closedAt: '2026-03-01' },
  { name: 'Catering Event Management', value: 38000000, stage: 'won', contactIdx: 19, closedAt: '2026-03-10' },

  // lost (1) — with closed_at
  { name: 'Photography Portfolio Website', value: 15000000, stage: 'lost', contactIdx: 18, closedAt: '2026-03-05' },
];

// ----------------------------------------------------------------
// Seed functions
// ----------------------------------------------------------------

async function seedUser(client) {
  const passwordHash = hashPassword(DEMO_USER.password);
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [DEMO_USER.name, DEMO_USER.email, passwordHash, DEMO_USER.role]
  );

  if (result.rowCount > 0) {
    return result.rows[0].id;
  }

  // Already exists — fetch id
  const existing = await client.query('SELECT id FROM users WHERE email = $1', [DEMO_USER.email]);
  return existing.rows[0].id;
}

async function seedContacts(client, ownerId) {
  // Check if demo contacts already exist (by owner + count)
  const existing = await client.query(
    'SELECT id, email FROM contacts WHERE owner_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC',
    [ownerId]
  );

  if (existing.rows.length >= DEMO_CONTACTS.length) {
    // Already seeded — return existing IDs in order
    return { inserted: 0, ids: existing.rows.map(r => r.id) };
  }

  let inserted = 0;
  const ids = [];
  const existingEmails = new Set(existing.rows.map(r => r.email));

  for (const c of DEMO_CONTACTS) {
    if (existingEmails.has(c.email)) {
      // Find existing ID
      const found = existing.rows.find(r => r.email === c.email);
      ids.push(found?.id ?? null);
      continue;
    }

    const result = await client.query(
      `INSERT INTO contacts (name, email, phone, title, owner_id, custom_fields)
       VALUES ($1, $2, $3, $4, $5, '{}')
       RETURNING id`,
      [c.name, c.email, c.phone, c.title, ownerId]
    );

    ids.push(result.rows[0].id);
    inserted++;
  }

  return { inserted, ids };
}

async function seedDeals(client, ownerId, contactIds) {
  // Check if demo deals already exist (by owner)
  const existing = await client.query(
    'SELECT name FROM deals WHERE owner_id = $1 AND deleted_at IS NULL',
    [ownerId]
  );
  const existingNames = new Set(existing.rows.map(r => r.name));

  let inserted = 0;

  for (const d of DEAL_TEMPLATES) {
    if (existingNames.has(d.name)) continue;

    const contactId = contactIds[d.contactIdx] ?? null;
    const closedAt = d.closedAt ? new Date(d.closedAt).toISOString() : null;

    await client.query(
      `INSERT INTO deals (name, value, stage, contact_id, owner_id, closed_at, custom_fields)
       VALUES ($1, $2, $3, $4, $5, $6, '{}')`,
      [d.name, d.value, d.stage, contactId, ownerId, closedAt]
    );

    inserted++;
  }

  return inserted;
}


// ----------------------------------------------------------------
// Main
// ----------------------------------------------------------------

async function seed() {
  const client = await pool.connect();
  console.log('\n🌱 izhubs ERP — Demo Seed\n');

  try {
    // User
    process.stdout.write('  📧 Seeding admin user...');
    const userId = await seedUser(client);
    console.log(` ✅ ${DEMO_USER.email}`);

    // Contacts
    process.stdout.write('  👥 Seeding contacts...');
    const { inserted: contactsInserted, ids: contactIds } = await seedContacts(client, userId);
    console.log(` ✅ ${contactsInserted} new (${DEMO_CONTACTS.length} total)`);

    // Deals
    process.stdout.write('  💼 Seeding deals...');
    const dealsInserted = await seedDeals(client, userId, contactIds);
    console.log(` ✅ ${dealsInserted} new (${DEAL_TEMPLATES.length} total)`);

    console.log('\n✅ Seeded: 1 user, 20 contacts, 15 deals');
    console.log(`\n   Login: ${DEMO_USER.email} / ${DEMO_USER.password}`);
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

seed();
