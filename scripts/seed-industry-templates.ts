#!/usr/bin/env tsx
// =============================================================
// izhubs ERP — Seed Industry Templates into DB
// Run ONCE at system init (or when adding new templates).
// Usage:  npm run seed:industry-templates
//         npx tsx scripts/seed-industry-templates.ts [--dry-run]
//
// This populates the `industry_templates` table from the .ts files.
// After seeding, the DB is the sole runtime source of truth.
// =============================================================

import { TEMPLATES } from '@izerp-theme/templates';
import { db } from '../core/engine/db';

const DRY_RUN = process.argv.includes('--dry-run');

interface SeedRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  nav_config: object;
  theme_defaults: object;
  required_modules: string[];
  version: string;
}

async function seedIndustryTemplates() {
  console.log(`\n🌱 Seeding industry templates${DRY_RUN ? ' [DRY RUN — no DB writes]' : ''}...\n`);

  const rows: SeedRow[] = TEMPLATES.map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon,
    category: t.category,
    nav_config: t.navConfig ?? {},
    theme_defaults: t.themeDefaults ?? {},
    required_modules: t.suggestedModules ?? [],
    version: t.version ?? '1.0.0',
  }));

  // Validate schemas before writing
  let validCount = 0;
  const { NavConfigSchema } = await import('@izerp-theme/templates/engine/template.schema');
  for (const row of rows) {
    const result = NavConfigSchema.safeParse(row.nav_config);
    if (!result.success) {
      console.error(`  ❌ ${row.id}: navConfig failed validation`);
      console.error('    ', result.error.flatten());
      process.exit(1);
    }
    console.log(`  ✅ ${row.id}: "${row.name}" — ${JSON.stringify(row.nav_config).length} bytes`);
    validCount++;
  }

  if (DRY_RUN) {
    console.log(`\n✔  Dry run complete. ${validCount} templates validated, no DB write.`);
    process.exit(0);
  }

  // Upsert into industry_templates
  for (const row of rows) {
    await db.query(
      `INSERT INTO industry_templates
         (id, name, description, icon, category, nav_config, theme_defaults, required_modules, version, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name             = EXCLUDED.name,
         description      = EXCLUDED.description,
         icon             = EXCLUDED.icon,
         category         = EXCLUDED.category,
         nav_config       = EXCLUDED.nav_config,
         theme_defaults   = EXCLUDED.theme_defaults,
         required_modules = EXCLUDED.required_modules,
         version          = EXCLUDED.version,
         updated_at       = NOW()`,
      [
        row.id,
        row.name,
        row.description,
        row.icon,
        row.category,
        JSON.stringify(row.nav_config),
        JSON.stringify(row.theme_defaults),
        JSON.stringify(row.required_modules),
        row.version,
      ]
    );
  }

  console.log(`\n✔  Seeded ${validCount} industry templates into DB.`);
  process.exit(0);
}

seedIndustryTemplates().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
