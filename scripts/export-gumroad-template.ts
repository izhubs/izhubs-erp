#!/usr/bin/env tsx
// ============================================================
// izhubs ERP — Gumroad Template Exporter
// Exports one or all industry templates as a ready-to-sell
// ZIP package for Gumroad distribution.
//
// Usage:
//   npx tsx scripts/export-gumroad-template.ts --template=agency
//   npx tsx scripts/export-gumroad-template.ts --all
//
// Output: dist/gumroad/{templateId}/  (then zip manually or via CI)
// ============================================================

import fs from 'fs';
import path from 'path';
import { TEMPLATES } from '@izerp-theme/templates';
import type { IndustryTemplate } from '@izerp-theme/templates/engine/template.schema';

const args = process.argv.slice(2);
const templateArg = args.find(a => a.startsWith('--template='))?.split('=')[1];
const exportAll  = args.includes('--all');

if (!templateArg && !exportAll) {
  console.error('Usage: --template=agency  OR  --all');
  process.exit(1);
}

const toExport: IndustryTemplate[] = exportAll
  ? TEMPLATES
  : TEMPLATES.filter((t: any) => t.id === templateArg);

if (toExport.length === 0) {
  console.error(`Template "${templateArg}" not found. Available: ${TEMPLATES.map((t: any) => t.id).join(', ')}`);
  process.exit(1);
}

const DIST = path.join(process.cwd(), 'dist', 'gumroad');

function writePackage(t: IndustryTemplate) {
  const dir = path.join(DIST, t.id);
  fs.mkdirSync(dir, { recursive: true });

  // 1. template.json — the importable config file
  const pkg = {
    $schema: 'https://izhubs.com/schemas/template/v1.json',
    version: t.version,
    author: t.author,
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon,
    category: t.category,
    tags: t.tags,
    pipelineStages: t.pipelineStages,
    customFields: t.customFields,
    automations: t.automations,
    suggestedModules: t.suggestedModules,
    navConfig: t.navConfig,
    themeDefaults: t.themeDefaults ?? {},
    exportedAt: new Date().toISOString(),
    importUrl: 'https://app.izhubs.com/settings/templates/import',
  };
  fs.writeFileSync(path.join(dir, 'template.json'), JSON.stringify(pkg, null, 2));

  // 2. sample-contacts.csv
  const contactHeaders = ['Name', 'Email', 'Phone', 'Title', 'Status', 'Channel'];
  const sampleContacts = generateSampleContacts(t);
  const contactCsv = [contactHeaders.join(','), ...sampleContacts].join('\n');
  fs.writeFileSync(path.join(dir, 'sample-contacts.csv'), contactCsv);

  // 3. sample-deals.csv
  const dealHeaders = ['Title', 'Stage', 'Value', 'Contact'];
  const sampleDeals = generateSampleDeals(t);
  const dealCsv = [dealHeaders.join(','), ...sampleDeals].join('\n');
  fs.writeFileSync(path.join(dir, 'sample-deals.csv'), dealCsv);

  // 4. IMPORT_GUIDE.md
  const guide = generateImportGuide(t);
  fs.writeFileSync(path.join(dir, 'IMPORT_GUIDE.md'), guide);

  // 5. WHATS_INCLUDED.md
  const whatsIncluded = generateWhatsIncluded(t);
  fs.writeFileSync(path.join(dir, 'WHATS_INCLUDED.md'), whatsIncluded);

  console.log(`✅ Exported: dist/gumroad/${t.id}/`);
  console.log(`   → template.json        (importable config)`);
  console.log(`   → sample-contacts.csv  (${sampleContacts.length} sample contacts)`);
  console.log(`   → sample-deals.csv     (${sampleDeals.length} sample deals)`);
  console.log(`   → IMPORT_GUIDE.md`);
  console.log(`   → WHATS_INCLUDED.md`);
}

// ---- Sample Data Generators ----

function generateSampleContacts(t: IndustryTemplate): string[] {
  const byTemplate: Record<string, string[]> = {
    agency: [
      '"Nguyen Van A","nguyen.a@startup.com","0901234567","CEO","Lead","Google"',
      '"Tran Thi B","tran.b@agency.vn","0912345678","Marketing Director","Customer","Referral"',
      '"Le Van C","le.c@brand.com","0923456789","CMO","Lead","LinkedIn"',
      '"Pham Thi D","pham.d@ecommerce.vn","0934567890","Founder","Prospect","Cold outreach"',
      '"Hoang Van E","hoang.e@corp.com","0945678901","Head of Growth","Customer","Facebook"',
    ],
    restaurant: [
      '"Nguyen Van A","a@catering.vn","0901234567","Restaurant Owner","Lead","Walk-in"',
      '"Tran Thi B","b@restaurant.vn","0912345678","F&B Manager","Customer","Referral"',
      '"Le Van C","c@hotel.vn","0923456789","Executive Chef","Lead","Instagram"',
    ],
    coworking: [
      '"Nguyen Van A","a@startup.vn","0901234567","Founder","Lead","Walk-in"',
      '"Tran Thi B","b@freelancer.vn","0912345678","Designer","Customer","Website"',
      '"Le Van C","c@smb.vn","0923456789","Director","Prospect","LinkedIn"',
    ],
  };
  return byTemplate[t.id] ?? byTemplate['agency'];
}

function generateSampleDeals(t: IndustryTemplate): string[] {
  const firstStage = t.pipelineStages[0]?.key ?? 'lead';
  const midStage = t.pipelineStages[Math.floor(t.pipelineStages.length / 2)]?.key ?? 'negotiation';
  return [
    `"Sample Deal 1 — ${t.name}","${firstStage}","5000000","Nguyen Van A"`,
    `"Sample Deal 2 — ${t.name}","${midStage}","12000000","Tran Thi B"`,
    `"Sample Deal 3 — ${t.name}","${firstStage}","8500000","Le Van C"`,
  ];
}

function generateImportGuide(t: IndustryTemplate): string {
  return `# Import Guide — ${t.name} Template for izhubs ERP

## Step 1: Open izhubs ERP
Go to [app.izhubs.com](https://app.izhubs.com) or your self-hosted instance.

## Step 2: Import the Template
1. Go to **Settings → Industry Template**
2. Click **Import from file**
3. Select \`template.json\` from this package
4. Click **Apply** — your pipeline stages, custom fields, and navigation will be configured instantly

## Step 3: Import Sample Data (Optional)
To populate your CRM with sample contacts and deals:
1. Go to **Import** in the sidebar
2. Upload \`sample-contacts.csv\`
3. Let AI map the columns automatically
4. Upload \`sample-deals.csv\` next

## What gets configured
- **${t.pipelineStages.length} pipeline stages**: ${t.pipelineStages.map((s: any) => s.label).join(' → ')}
- **${t.customFields.length} custom fields** tailored for ${t.name}
- **${t.automations.length} automations** pre-configured
- Dashboard layout with relevant widgets
- Sidebar navigation for your team roles

## Support
- Docs: https://docs.izhubs.com/templates/${t.id}
- Email: support@izhubs.com
- GitHub: https://github.com/izhubs/izhubs-erp/discussions
`;
}

function generateWhatsIncluded(t: IndustryTemplate): string {
  const stages = t.pipelineStages.map((s: any) => `  - ${s.label}`).join('\n');
  const fields = t.customFields.map((f: any) => `  - **${f.label}** (${f.entity}, ${f.type})`).join('\n');
  const autos = t.automations.map((a: any) => `  - ${a.name}`).join('\n');
  return `# What's Included — ${t.icon} ${t.name} Template

> **izhubs ERP Industry Template** | v${t.version}
> For ${t.description}

---

## 📁 Files in This Package

| File | Purpose |
|------|---------|
| \`template.json\` | Main importable config — apply to izhubs in 1 click |
| \`sample-contacts.csv\` | Sample contacts to get started immediately |
| \`sample-deals.csv\` | Sample deals matching your pipeline |
| \`IMPORT_GUIDE.md\` | Step-by-step setup instructions |
| \`WHATS_INCLUDED.md\` | This file |

---

## 🔁 Pipeline Stages (${t.pipelineStages.length} stages)

${stages}

## 🏷️ Custom Fields (${t.customFields.length} fields)

${fields}

## ⚡ Automations (${t.automations.length} pre-built)

${autos.length ? autos : '  *(None in this tier)*'}

---

## 📦 Suggested Modules
${t.suggestedModules.map((m: any) => `- ${m}`).join('\n')}

---

## 🔗 Resources
- izhubs ERP: https://izhubs.com
- Docs: https://docs.izhubs.com
- Self-host: https://github.com/izhubs/izhubs-erp

---
*This template is compatible with izhubs ERP v0.1+*
`;
}

// ---- Run ----
console.log(`\n📦 Exporting ${toExport.length} Gumroad template(s)...\n`);
for (const t of toExport) {
  writePackage(t);
}
console.log('\n✔  Done! Zip the folders and upload to Gumroad.\n');
console.log('  To zip (macOS/Linux):');
toExport.forEach(t => console.log(`  cd dist/gumroad && zip -r ${t.id}-template.zip ${t.id}/`));
