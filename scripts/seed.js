#!/usr/bin/env node
// =============================================================
// izhubs ERP — Industry Seed Runner
// Usage:
//   node scripts/seed.js --industry=agency
//   node scripts/seed.js --industry=virtual-office
//   node scripts/seed.js --industry=virtual-office --lang=vi
//   node scripts/seed.js --industry=all
//
// Available: agency | freelancer | coworking | restaurant | cafe | virtual-office
// Lang flag: --lang=en (default) | --lang=vi
// =============================================================

const { runSeed } = require('./seeds/_base');

const INDUSTRIES = {
  agency:          () => require('./seeds/seed-agency'),
  freelancer:      () => require('./seeds/seed-freelancer'),
  coworking:       () => require('./seeds/seed-coworking'),
  restaurant:      () => require('./seeds/seed-restaurant'),
  cafe:            () => require('./seeds/seed-cafe'),
  'virtual-office':() => require('./seeds/seed-virtual-office'),
};

/**
 * Resolve the correct contacts/deals from a seed module.
 * Bilingual modules export contacts_en/contacts_vi/deals_en/deals_vi.
 * Legacy modules just export contacts/deals.
 */
function resolveLocaleData(seedModule, lang = 'en') {
  const contacts = seedModule[`contacts_${lang}`] ?? seedModule.contacts;
  const deals    = seedModule[`deals_${lang}`]    ?? seedModule.deals;
  if (!contacts || !deals) {
    throw new Error(
      `Seed module does not export contacts/deals for lang="${lang}". ` +
      `Available keys: ${Object.keys(seedModule).join(', ')}`
    );
  }
  return { ...seedModule, contacts, deals };
}

async function main() {
  const industryArg = process.argv.find(a => a.startsWith('--industry='));
  const langArg     = process.argv.find(a => a.startsWith('--lang='));

  const industry = industryArg ? industryArg.split('=')[1] : 'agency';
  const lang     = langArg     ? langArg.split('=')[1]     : 'en';

  if (!['en', 'vi'].includes(lang)) {
    console.error(`❌ Unknown lang: "${lang}". Use --lang=en or --lang=vi`);
    process.exit(1);
  }

  if (industry === 'all') {
    for (const [name, loader] of Object.entries(INDUSTRIES)) {
      const module = loader();
      await runSeed(resolveLocaleData(module, lang));
    }
    return;
  }

  if (!INDUSTRIES[industry]) {
    console.error(`❌ Unknown industry: "${industry}"`);
    console.error(`   Available: ${Object.keys(INDUSTRIES).join(' | ')}`);
    process.exit(1);
  }

  const module = INDUSTRIES[industry]();
  await runSeed(resolveLocaleData(module, lang));
}

main();
