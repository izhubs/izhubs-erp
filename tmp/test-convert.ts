import { db } from '../core/engine/db';

async function main() {
  console.log('Testing convertToContact directly...\n');

  // Get the latest submission from the form with autoConvertLead=true
  const formRes = await db.query(`SELECT id, tenant_id, auto_convert_lead FROM iz_forms WHERE auto_convert_lead = true AND deleted_at IS NULL LIMIT 1`);
  if (!formRes.rows[0]) { console.log('No auto-convert form found'); process.exit(1); }
  const form = formRes.rows[0];
  console.log('Form:', form.id);

  const subRes = await db.query(`SELECT id, data, contact_id FROM iz_form_submissions WHERE form_id = $1 ORDER BY submitted_at DESC LIMIT 1`, [form.id]);
  if (!subRes.rows[0]) { console.log('No submissions found'); process.exit(1); }
  const sub = subRes.rows[0];
  console.log('Submission:', sub.id);
  console.log('Data:', JSON.stringify(sub.data));
  console.log('Current contactId:', sub.contact_id);

  // Try the conversion manually
  const data = sub.data as Record<string, string>;
  
  // Smart field lookup
  const find = (keys: string[]) => {
    for (const k of keys) {
      const found = Object.entries(data).find(([key]) => key.toLowerCase() === k.toLowerCase());
      if (found?.[1]) return found[1];
    }
    return null;
  };

  const contactName = find(['name', 'full name', 'fullName', 'full_name']) ?? 'Unknown';
  const contactEmail = find(['email', 'e-mail', 'emailAddress']);
  const contactPhone = find(['phone', 'phone number', 'phoneNumber']);

  console.log('\nMapped fields:');
  console.log('  name:', contactName);
  console.log('  email:', contactEmail);
  console.log('  phone:', contactPhone);

  try {
    const contactRes = await db.query(
      `INSERT INTO contacts (tenant_id, name, email, phone, source)
       VALUES ($1, $2, $3, $4, 'izform')
       ON CONFLICT (tenant_id, email) WHERE email IS NOT NULL
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [form.tenant_id, contactName, contactEmail, contactPhone]
    );
    const contactId = contactRes.rows[0].id;
    console.log('\n✅ Contact created! ID:', contactId);

    // Link back
    await db.query(`UPDATE iz_form_submissions SET contact_id = $1 WHERE id = $2`, [contactId, sub.id]);
    console.log('✅ Submission linked to contact');
  } catch (err) {
    console.error('\n❌ Error creating contact:', err);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
