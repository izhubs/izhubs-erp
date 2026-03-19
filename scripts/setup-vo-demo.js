// Setup Virtual Office demo data
const { Client } = require('pg');

const DB = 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp';
const TENANT = '00000000-0000-0000-0000-000000000001';

const VO_CONTACTS = [
  { name: 'Công ty TNHH Minh Phát', email: 'info@minhphat.vn', title: 'Giám đốc' },
  { name: 'StartupVN Solutions', email: 'ceo@startupvn.io', title: 'CEO' },
  { name: 'Thương mại Hoàng Gia', email: 'admin@hoanggia.com.vn', title: 'Kế toán trưởng' },
  { name: 'TechHouse Vietnam', email: 'office@techhouse.vn', title: 'Giám đốc Điều hành' },
  { name: 'Đầu tư ABC Capital', email: 'contact@abccapital.vn', title: 'Trưởng phòng Pháp lý' },
  { name: 'SaaS Factory Vietnam', email: 'admin@saasfactory.vn', title: 'CTO' },
  { name: 'Green Import Export', email: 'mail@greenimex.vn', title: 'Giám đốc' },
  { name: 'Fintech Hub HCM', email: 'hello@fintechhub.vn', title: 'CEO' },
  { name: 'Logistics Pro Vietnam', email: 'ops@logisticspro.vn', title: 'Giám đốc Vận hành' },
  { name: 'Media Studio Saigon', email: 'studio@mediasaigon.vn', title: 'Creative Director' },
  { name: 'NextGen Consulting', email: 'info@nextgen.vn', title: 'Managing Partner' },
  { name: 'E-trade Solutions', email: 'admin@etrade.vn', title: 'Giám đốc Thương mại' },
  { name: 'Healthcare Analytics VN', email: 'data@havn.vn', title: 'COO' },
  { name: 'Real Estate Link', email: 'office@relink.vn', title: 'Trưởng phòng Kinh doanh' },
  { name: 'Digital First Agency', email: 'hello@digitalfirst.vn', title: 'CEO & Founder' },
];

const VO_DEALS = [
  { name: 'Công ty TNHH Minh Phát — Gói Cơ bản', stage: 'active',      value: 3000000,  pkg: 'Basic' },
  { name: 'StartupVN Solutions — Gói Pro',         stage: 'active',      value: 5000000,  pkg: 'Pro' },
  { name: 'Thương mại Hoàng Gia — Gói Enterprise', stage: 'active',      value: 12000000, pkg: 'Enterprise' },
  { name: 'TechHouse Vietnam — Gói Pro',           stage: 'active',      value: 5000000,  pkg: 'Pro' },
  { name: 'Đầu tư ABC Capital — Gói Enterprise',   stage: 'renewal',     value: 12000000, pkg: 'Enterprise' },
  { name: 'SaaS Factory Vietnam — Gói Pro',        stage: 'renewal',     value: 5000000,  pkg: 'Pro' },
  { name: 'Green Import Export — Gói Cơ bản',      stage: 'onboarding',  value: 3000000,  pkg: 'Basic' },
  { name: 'Fintech Hub HCM — Gói Enterprise',      stage: 'onboarding',  value: 12000000, pkg: 'Enterprise' },
  { name: 'Logistics Pro Vietnam — Gói Pro',       stage: 'negotiation', value: 5000000,  pkg: 'Pro' },
  { name: 'Media Studio Saigon — Gói Cơ bản',     stage: 'negotiation', value: 3000000,  pkg: 'Basic' },
  { name: 'NextGen Consulting — Gói Pro',          stage: 'proposal',    value: 5000000,  pkg: 'Pro' },
  { name: 'E-trade Solutions — Gói Enterprise',    stage: 'proposal',    value: 12000000, pkg: 'Enterprise' },
  { name: 'Healthcare Analytics VN — Gói Pro',    stage: 'lead',        value: 5000000,  pkg: 'Pro' },
  { name: 'Real Estate Link — Gói Cơ bản',        stage: 'won',         value: 3000000,  pkg: 'Basic' },
  { name: 'Digital First Agency — Gói Enterprise', stage: 'lost',        value: 12000000, pkg: 'Enterprise' },
];

async function main() {
  const c = new Client({ connectionString: DB });
  await c.connect();

  await c.query("UPDATE tenants SET industry = 'virtual-office' WHERE id = $1", [TENANT]);
  console.log('✅ Tenant industry → virtual-office');

  const existing = await c.query('SELECT count(*) as n FROM contacts WHERE tenant_id = $1', [TENANT]);
  const existingCount = parseInt(existing.rows[0].n);

  let contactIds = [];
  if (existingCount < 5) {
    for (const ct of VO_CONTACTS) {
      const res = await c.query(
        `INSERT INTO contacts (tenant_id, name, email, title, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
        [TENANT, ct.name, ct.email, ct.title]
      );
      contactIds.push(res.rows[0].id);
    }
    console.log('✅ Seeded ' + contactIds.length + ' contacts');
  } else {
    const res = await c.query('SELECT id FROM contacts WHERE tenant_id = $1 ORDER BY created_at LIMIT 15', [TENANT]);
    contactIds = res.rows.map(r => r.id);
    console.log('ℹ️  Using ' + contactIds.length + ' existing contacts');
  }

  await c.query("DELETE FROM deals WHERE tenant_id = $1 AND name LIKE '%Gói%'", [TENANT]);

  for (let i = 0; i < VO_DEALS.length; i++) {
    const d = VO_DEALS[i];
    const contactId = contactIds[i % contactIds.length];
    const daysAgo = Math.floor(Math.random() * 30);
    await c.query(
      `INSERT INTO deals (tenant_id, name, stage, value, contact_id, custom_fields, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW() - ($7 || ' days')::interval, NOW() - ($7 || ' days')::interval)`,
      [TENANT, d.name, d.stage, d.value, contactId, JSON.stringify({ goi_dich_vu: d.pkg }), String(daysAgo)]
    );
  }
  console.log('✅ Seeded ' + VO_DEALS.length + ' deals with VO stages');

  const stages = await c.query('SELECT stage, count(*) as n FROM deals WHERE tenant_id = $1 GROUP BY stage ORDER BY n DESC', [TENANT]);
  console.log('\n📊 Deal stages:');
  stages.rows.forEach(r => console.log('   ' + r.stage + ': ' + r.n));

  await c.end();
  console.log('\n🎉 Done! Restart Next.js dev server to see changes.');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
