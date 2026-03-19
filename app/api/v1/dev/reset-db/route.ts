import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    // Attempting to run the db reset script
    const { stdout, stderr } = await execAsync('node scripts/db-reset.js');
    console.log('DB Reset output:', stdout);
    if (stderr) console.error('DB Reset errors:', stderr);

    return NextResponse.json({ success: true, message: 'Database reset successfully' });
  } catch (error: any) {
    console.error('DB Reset failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to reset database' }, { status: 500 });
  }
}
