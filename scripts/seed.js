#!/usr/bin/env node
// =============================================================
// izhubs ERP — Industry Seed Runner
// Usage:
//   node scripts/seed.js --industry=agency
//   node scripts/seed.js --industry=restaurant
//   node scripts/seed.js --industry=all
//
// Available: agency | freelancer | coworking | restaurant | cafe
// =============================================================

const { runSeed } = require('./seeds/_base');

const INDUSTRIES = {
  agency:     () => require('./seeds/seed-agency'),
  freelancer: () => require('./seeds/seed-freelancer'),
  coworking:  () => require('./seeds/seed-coworking'),
  restaurant: () => require('./seeds/seed-restaurant'),
  cafe:       () => require('./seeds/seed-cafe'),
};

async function main() {
  const arg = process.argv.find(a => a.startsWith('--industry='));
  const industry = arg ? arg.split('=')[1] : 'agency';

  if (industry === 'all') {
    for (const [name, loader] of Object.entries(INDUSTRIES)) {
      await runSeed(loader());
    }
    return;
  }

  if (!INDUSTRIES[industry]) {
    console.error(`❌ Unknown industry: "${industry}"`);
    console.error(`   Available: ${Object.keys(INDUSTRIES).join(' | ')}`);
    process.exit(1);
  }

  await runSeed(INDUSTRIES[industry]());
}

main();
