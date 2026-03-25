export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run the worker in the Node.js runtime (avoids Edge runtime errors)
    const { initSyncWorker } = await import('./core/engine/jobs');
    
    // We don't await this because we want it to run in the background
    initSyncWorker().catch((err) => {
      console.error('[BullMQ] Failed to initialize Sync Worker:', err);
    });
  }
}
