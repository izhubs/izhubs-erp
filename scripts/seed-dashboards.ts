import fs from 'fs';
import path from 'path';
import { db } from '../core/engine/db';

async function seedDashboards() {
  console.log('🔄 Seeding Dashboard Configurations...');

  // 0. Apply Migration 018 (Fix constraint) before seeding
  console.log('🛠️ Applying Migration 018 to fix dashboard configs UNIQUE constraint...');
  try {
    await db.query(`
      ALTER TABLE dashboard_configs DROP CONSTRAINT IF EXISTS dashboard_configs_tenant_id_slug_key;
    `);
    await db.query(`
      ALTER TABLE dashboard_configs ADD CONSTRAINT dashboard_configs_tenant_slug_role_key UNIQUE (tenant_id, slug, role);
    `);
    console.log('✅ Constraint updated successfully.');
  } catch (err: any) {
    if (!err.message.includes('already exists')) {
      console.error('⚠️ Could not apply constraint (maybe already applied):', err.message);
    }
  }

  // 1. Fetch all tenants and their industries
  const res = await db.query('SELECT id, industry FROM tenants');
  const tenants = res.rows;

  if (tenants.length === 0) {
    console.log('⚠️ No tenants found to seed dashboards.');
    process.exit(0);
  }

  // 2. Map templates available
  const templatesDir = path.join(process.cwd(), 'templates', 'dashboards');
  const availableIndustries = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());

  let totalInserted = 0;

  for (const tenant of tenants) {
    const industry = tenant.industry;
    
    // If we have templates for this industry
    if (availableIndustries.includes(industry)) {
      const indDir = path.join(templatesDir, industry);
      const files = fs.readdirSync(indDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const raw = fs.readFileSync(path.join(indDir, file), 'utf-8');
        const config = JSON.parse(raw);
        
        const role = config.role;
        const layoutJson = { grid: config.grid };
        const name = `${industry.toUpperCase()} - ${role} Dashboard`;
        const slug = 'main';

        try {
          // Upsert using the new constraint: (tenant_id, slug, role)
          await db.query(`
            INSERT INTO dashboard_configs (tenant_id, name, slug, role, is_default, layout_json)
            VALUES ($1, $2, $3, $4, true, $5)
            ON CONFLICT ON CONSTRAINT dashboard_configs_tenant_slug_role_key
            DO UPDATE SET 
              name = EXCLUDED.name,
              layout_json = EXCLUDED.layout_json,
              updated_at = NOW()
          `, [
            tenant.id,
            name,
            slug,
            role,
            JSON.stringify(layoutJson)
          ]);

          console.log(`✅ Upserted dashboard for Tenant ${tenant.id.split('-')[0]}... | Role: ${role}`);
          totalInserted++;
        } catch (error) {
          console.error(`❌ Failed to upsert dashboard for Tenant ${tenant.id} | Role: ${role}`, error);
        }
      }
    } else {
      console.log(`⏩ No dashboard templates found for industry: ${industry} (Tenant: ${tenant.id.split('-')[0]})`);
    }
  }

  console.log(`🎉 Seed complete! Processed ${totalInserted} dashboard layouts.`);
  process.exit(0);
}

seedDashboards().catch((err) => {
  console.error('Fatal error seeding dashboards:', err);
  process.exit(1);
});
