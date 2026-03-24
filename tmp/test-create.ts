import { createProject } from '@/core/engine/izlanding';
import { db } from '@/core/engine/db';

async function test() {
  try {
    const tenantId = '00000000-0000-0000-0000-000000000001';
    console.log('Testing createProject manual mode...');
    const result = await createProject(tenantId, { name: 'Test Manual Project', templateId: 'blank' });
    console.log('Success:', result);
  } catch (err: any) {
    console.error('Error:', err.message || err);
  } finally {
    process.exit(0);
  }
}

test();
