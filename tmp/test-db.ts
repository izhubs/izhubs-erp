import { db } from '../core/engine/db';

async function main() {
  console.log("Translating izform module in DB to English...");
  await db.query(`
    UPDATE modules 
    SET name = 'izForm — Lead Capture Forms',
        description = 'Create custom lead capture forms and embed them into your marketing sites via iframe.'
    WHERE id = 'izform'
  `);
  console.log("Done!");
  process.exit(0);
}
main().catch(console.error);
