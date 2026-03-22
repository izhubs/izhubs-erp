const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:izhubs_dev_2026@localhost:5432/izhubs_erp' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT p.id, p.name, p.description, p.status, pg.content_json, pg.tracking_scripts
      FROM iz_landing_projects p
      JOIN iz_landing_pages pg ON pg.project_id = p.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `, ['55c53222-a807-474a-91f3-0431fa57f0bb']);
    console.log("ROWS:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("DB ERROR:", err.message);
  } finally {
    pool.end();
  }
}

run();
